package com.batdongsan.service;

import com.batdongsan.dto.location.*;
import com.batdongsan.entity.District;
import com.batdongsan.entity.Province;
import com.batdongsan.entity.Ward;
import com.batdongsan.exception.ConflictException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.DistrictRepository;
import com.batdongsan.repository.ProvinceRepository;
import com.batdongsan.repository.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {
    private final ProvinceRepository provinces;
    private final DistrictRepository districts;
    private final WardRepository wards;

    public LocationService(ProvinceRepository provinces, DistrictRepository districts, WardRepository wards) {
        this.provinces = provinces;
        this.districts = districts;
        this.wards = wards;
    }

    @Transactional(readOnly = true)
    public Page<ProvinceRes> getProvinces(Pageable pageable) {
        return provinces.findAll(pageable).map(ProvinceRes::new);
    }

    @Transactional(readOnly = true)
    public Page<DistrictRes> getDistricts(Long provinceId, Pageable pageable) {
        if (!provinces.existsById(provinceId)) throw new ResourceNotFoundException("Không tìm thấy tỉnh/thành phố.");
        return districts.findByProvinceId(provinceId, pageable).map(DistrictRes::new);
    }

    @Transactional(readOnly = true)
    public Page<WardRes> getWards(Long districtId, Pageable pageable) {
        if (!districts.existsById(districtId)) throw new ResourceNotFoundException("Không tìm thấy quận/huyện.");
        return wards.findByDistrictId(districtId, pageable).map(WardRes::new);
    }

    @Transactional(readOnly = true)
    public Page<DistrictRes> getAllDistricts(Pageable pageable) {
        return districts.findAll(pageable).map(DistrictRes::new);
    }

    @Transactional(readOnly = true)
    public Page<WardRes> getAllWards(Pageable pageable) {
        return wards.findAll(pageable).map(WardRes::new);
    }

    @Transactional
    public ProvinceRes createProvince(ProvinceReq request) {
        Province province = new Province();
        province.setName(request.getName().trim());
        return new ProvinceRes(provinces.save(province));
    }

    @Transactional
    public ProvinceRes updateProvince(Long id, ProvinceReq request) {
        Province province = provinces.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tỉnh/thành phố."));
        province.setName(request.getName().trim());
        return new ProvinceRes(provinces.save(province));
    }

    @Transactional
    public void deleteProvince(Long id) {
        Province province = provinces.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tỉnh/thành phố."));
        provinces.delete(province);
        provinces.flush();
    }

    @Transactional
    public DistrictRes createDistrict(DistrictReq request) {
        District district = new District();
        applyDistrict(district, request);
        return new DistrictRes(districts.save(district));
    }

    @Transactional
    public DistrictRes updateDistrict(Long id, DistrictReq request) {
        District district = districts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quận/huyện."));
        applyDistrict(district, request);
        return new DistrictRes(districts.save(district));
    }

    @Transactional
    public void deleteDistrict(Long id) {
        District district = districts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quận/huyện."));
        districts.delete(district);
        districts.flush();
    }

    @Transactional
    public WardRes createWard(WardReq request) {
        if (wards.existsByCode(request.getCode())) throw new ConflictException("Mã phường/xã đã tồn tại.");
        Ward ward = new Ward();
        applyWard(ward, request);
        return new WardRes(wards.save(ward));
    }

    @Transactional
    public WardRes updateWard(Long id, WardReq request) {
        Ward ward = wards.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phường/xã."));
        if (wards.existsByCodeAndIdNot(request.getCode(), id))
            throw new ConflictException("Mã phường/xã đã tồn tại.");
        applyWard(ward, request);
        return new WardRes(wards.save(ward));
    }

    @Transactional
    public void deleteWard(Long id) {
        Ward ward = wards.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phường/xã."));
        wards.delete(ward);
        wards.flush();
    }

    private void applyDistrict(District district, DistrictReq request) {
        Province province = provinces.findById(request.getProvinceId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tỉnh/thành phố."));
        district.setProvince(province);
        district.setName(request.getName().trim());
    }

    private void applyWard(Ward ward, WardReq request) {
        District district = districts.findById(request.getDistrictId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quận/huyện."));
        ward.setDistrict(district);
        ward.setName(request.getName().trim());
        ward.setCode(request.getCode().trim());
    }
}
