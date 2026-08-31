package com.batdongsan.service;

import com.batdongsan.dto.ListingReq;
import com.batdongsan.entity.*;
import com.batdongsan.exception.ConflictException;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ForbiddenException;
import com.batdongsan.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {
    @Mock ListingRepository listingRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock ProjectRepository projectRepository;
    @Mock UserRepository userRepository;
    @Mock SavedListingRepository savedListingRepository;
    @Mock ListingStatusHistoryRepository historyRepository;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock NotificationService notificationService;
    @Mock LocationService locationService;

    private ListingService service;
    private User owner;
    private Category category;
    private AdministrativeProvince province;
    private CommuneUnit commune;

    @BeforeEach
    void setUp() {
        service = new ListingService(listingRepository, categoryRepository, projectRepository,
                userRepository, savedListingRepository, historyRepository,
                eventPublisher, notificationService, locationService);
        owner = user(1L, "owner@example.com");
        category = new Category(); category.setId(2L); category.setName("Nhà");
        category.setTransactionType(TransactionType.BUY);
        province = new AdministrativeProvince(); province.setId(3L); province.setOfficialCode("79");
        province.setOfficialName("Thành phố Hồ Chí Minh");
        commune = new CommuneUnit(); commune.setId(4L); commune.setOfficialCode("26734");
        commune.setOfficialName("Phường Bến Nghé"); commune.setUnitType(CommuneUnitType.WARD);
        commune.setAdministrativeProvince(province);
    }

    @Test
    void createStartsAsDraft() {
        stubReferences();
        when(listingRepository.save(any())).thenAnswer(i -> { Listing l = i.getArgument(0); l.setId(10L); return l; });

        var result = service.createListing(owner.getEmail(), request(null));

        assertEquals("DRAFT", result.getStatus());
        verify(historyRepository).save(argThat(h -> h.getFromStatus() == null && h.getToStatus() == ListingStatus.DRAFT));
    }

    @Test
    void anotherSellerCannotUpdateOrDeleteOrSubmit() {
        Listing listing = listing(ListingStatus.DRAFT);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));

        assertThrows(ForbiddenException.class, () -> service.updateListing(10L, "other@example.com", request(0L)));
        assertThrows(ForbiddenException.class, () -> service.deleteListing(10L, "other@example.com"));
        assertThrows(ForbiddenException.class, () -> service.submitListing(10L, "other@example.com"));
    }

    @Test
    void submitMovesDraftToPendingAndWritesHistory() {
        Listing listing = listing(ListingStatus.DRAFT);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));
        when(listingRepository.saveAndFlush(listing)).thenReturn(listing);

        service.submitListing(10L, owner.getEmail());

        assertEquals(ListingStatus.PENDING, listing.getStatus());
        verify(historyRepository).save(argThat(h -> h.getFromStatus() == ListingStatus.DRAFT
                && h.getToStatus() == ListingStatus.PENDING));
    }

    @Test
    void staleVersionIsRejected() {
        Listing listing = listing(ListingStatus.DRAFT);
        listing.setVersion(3L);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));

        assertThrows(ConflictException.class,
                () -> service.updateListing(10L, owner.getEmail(), request(2L)));
    }

    @Test
    void editingActiveListingMovesItBackToPending() {
        Listing listing = listing(ListingStatus.ACTIVE);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));
        stubReferences();
        when(listingRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));

        service.updateListing(10L, owner.getEmail(), request(0L));

        assertEquals(ListingStatus.PENDING, listing.getStatus());
        verify(historyRepository).save(argThat(h -> h.getFromStatus() == ListingStatus.ACTIVE
                && h.getToStatus() == ListingStatus.PENDING));
    }

    @Test
    void editingExpiredListingCreatesANewDraft() {
        Listing listing = listing(ListingStatus.EXPIRED);
        listing.setExpiresAt(LocalDateTime.now().minusDays(1));
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));
        stubReferences();
        when(listingRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));

        service.updateListing(10L, owner.getEmail(), request(0L));

        assertEquals(ListingStatus.DRAFT, listing.getStatus());
        assertNull(listing.getExpiresAt());
        verify(historyRepository).save(argThat(h -> h.getFromStatus() == ListingStatus.EXPIRED
                && h.getToStatus() == ListingStatus.DRAFT));
    }

    @Test
    void inactiveListingCanBeSubmittedAgain() {
        Listing listing = listing(ListingStatus.INACTIVE);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));
        when(listingRepository.saveAndFlush(listing)).thenReturn(listing);

        service.submitListing(10L, owner.getEmail());

        assertEquals(ListingStatus.PENDING, listing.getStatus());
    }

    @Test
    void activeAndPendingListingsCannotBeDeleted() {
        Listing active = listing(ListingStatus.ACTIVE);
        Listing pending = listing(ListingStatus.PENDING);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(active), Optional.of(pending));

        assertThrows(BadRequestException.class,
                () -> service.deleteListing(10L, owner.getEmail()));
        assertThrows(BadRequestException.class,
                () -> service.deleteListing(10L, owner.getEmail()));
        verify(listingRepository, never()).delete(any(Listing.class));
    }

    @Test
    void deletingListingPublishesItsStorageKeysForAfterCommitCleanup() {
        Listing listing = listing(ListingStatus.DRAFT);
        ListingImage first = new ListingImage(); first.setStorageKey("first.jpg");
        ListingImage second = new ListingImage(); second.setStorageKey("second.webp");
        listing.setImages(List.of(first, second));
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));

        service.deleteListing(10L, owner.getEmail());

        verify(listingRepository).delete(listing);
        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        ListingFilesDeletedEvent deleted = assertInstanceOf(ListingFilesDeletedEvent.class, eventCaptor.getValue());
        assertEquals(List.of("first.jpg", "second.webp"), deleted.storageKeys());
    }

    @Test
    void listingProjectMustBelongToSelectedCurrentAddress() {
        Listing listing = listing(ListingStatus.DRAFT);
        ListingReq request = request(0L);
        request.setProjectId(20L);
        AdministrativeProvince anotherProvince = new AdministrativeProvince(); anotherProvince.setId(99L);
        CommuneUnit anotherCommune = new CommuneUnit(); anotherCommune.setId(100L);
        anotherCommune.setAdministrativeProvince(anotherProvince);
        Project project = new Project(); project.setId(20L); project.setAdministrativeProvince(anotherProvince);
        project.setCommuneUnit(anotherCommune);
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(listing));
        stubReferences();
        when(projectRepository.findById(20L)).thenReturn(Optional.of(project));

        ApiException error = assertThrows(ApiException.class,
                () -> service.updateListing(10L, owner.getEmail(), request));

        assertEquals("Dự án không thuộc địa chỉ đã chọn.", error.getMessage());
        verify(listingRepository, never()).saveAndFlush(any());
    }

    @Test
    void removedListingCanBeEditedResubmittedOrDeletedByItsOwner() {
        Listing toEdit = removedListing();
        Listing toSubmit = removedListing();
        Listing toDelete = removedListing();
        when(listingRepository.findByIdForUpdate(10L)).thenReturn(
                Optional.of(toEdit), Optional.of(toSubmit), Optional.of(toDelete));
        when(listingRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        stubReferences();

        service.updateListing(10L, owner.getEmail(), request(0L));
        service.submitListing(10L, owner.getEmail());
        service.deleteListing(10L, owner.getEmail());

        assertEquals(ListingStatus.DRAFT, toEdit.getStatus());
        assertNull(toEdit.getRemovalReason());
        assertNull(toEdit.getRemovedAt());
        assertNull(toEdit.getRemovedBy());
        assertEquals(ListingStatus.PENDING, toSubmit.getStatus());
        assertNull(toSubmit.getRemovalReason());
        verify(listingRepository).delete(toDelete);
    }

    @Test
    void expirationMovesDueActiveListingsAndWritesHistory() {
        Listing listing = listing(ListingStatus.ACTIVE);
        when(listingRepository.findByStatusAndExpiresAtBefore(eq(ListingStatus.ACTIVE), any(LocalDateTime.class)))
                .thenReturn(List.of(listing));

        assertEquals(1, service.expireDueListings(LocalDateTime.now()));

        assertEquals(ListingStatus.EXPIRED, listing.getStatus());
        verify(historyRepository).save(argThat(h -> h.getFromStatus() == ListingStatus.ACTIVE
                && h.getToStatus() == ListingStatus.EXPIRED));
        verify(listingRepository).saveAll(List.of(listing));
    }

    private void stubReferences() {
        lenient().when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(locationService.resolveActiveAddress("79", "26734"))
                .thenReturn(new LocationService.CurrentAddress(province, commune));
    }

    private ListingReq request(Long version) {
        ListingReq req = new ListingReq();
        req.setCategoryId(2L); req.setProvinceCode("79"); req.setCommuneCode("26734"); req.setTitle("Nhà đẹp trung tâm");
        req.setDescription("Mô tả đầy đủ về bất động sản"); req.setPrice(BigDecimal.valueOf(2_000_000_000L));
        req.setArea(80.0); req.setAddress("123 Nguyễn Huệ"); req.setContactName("Nguyễn An");
        req.setContactPhone("0901234567"); req.setVersion(version);
        return req;
    }

    private Listing listing(ListingStatus status) {
        Listing listing = new Listing(); listing.setId(10L); listing.setUser(owner); listing.setCategory(category);
        listing.setAdministrativeProvince(province); listing.setCommuneUnit(commune);
        listing.setTitle("Tin cũ"); listing.setDescription("Mô tả cũ");
        listing.setPrice(BigDecimal.TEN); listing.setArea(10.0); listing.setAddress("Địa chỉ");
        listing.setContactName("An"); listing.setContactPhone("0901234567"); listing.setStatus(status); listing.setVersion(0L);
        return listing;
    }

    private Listing removedListing() {
        Listing listing = listing(ListingStatus.REMOVED);
        listing.setRemovalReason("Nội dung không còn phù hợp");
        listing.setRemovedAt(LocalDateTime.now());
        listing.setRemovedBy(owner);
        return listing;
    }

    private User user(Long id, String email) {
        User user = new User(); user.setId(id); user.setEmail(email); user.setName("Seller"); user.setRole(UserRole.SELLER);
        return user;
    }
}
