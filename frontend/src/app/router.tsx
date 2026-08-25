import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminRoute, AnonymousRoute, AuthenticatedRoute, SellerRoute } from './guards'

const PublicLayout = lazy(() => import('@/components/layout/PublicLayout'))
const AccountLayout = lazy(() => import('@/components/layout/AccountLayout'))
const SellerLayout = lazy(() => import('@/components/layout/SellerLayout'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const HomePage = lazy(() => import('@/pages/HomePage'))
const ListingPage = lazy(() => import('@/pages/ListingPage'))
const ListingDetailPage = lazy(() => import('@/pages/ListingDetailPage'))
const ProjectListPage = lazy(() => import('@/pages/ProjectListPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SecurityPage = lazy(() => import('@/pages/SecurityPage'))
const SavedListingsPage = lazy(() => import('@/pages/SavedListingsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const SellerUpgradePage = lazy(() => import('@/pages/SellerUpgradePage'))
const SellerDashboardPage = lazy(() => import('@/pages/SellerDashboardPage'))
const CreateListingPage = lazy(() => import('@/pages/CreateListingPage'))
const SellerListingDetailPage = lazy(() => import('@/pages/SellerListingDetailPage'))
const EditListingPage = lazy(() => import('@/pages/EditListingPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage'))
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const ModerationPage = lazy(() => import('@/pages/admin/ModerationPage'))
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'))
const CategoryManagementPage = lazy(() => import('@/pages/admin/CategoryManagementPage'))
const ProjectManagementPage = lazy(() => import('@/pages/admin/ProjectManagementPage'))
const LocationManagementPage = lazy(() => import('@/pages/admin/LocationManagementPage'))

function PageFallback() {
  return (
    <main className="grid min-h-[50vh] place-items-center" aria-busy="true">
      <p className="text-sm font-medium text-ink-600">Đang tải trang…</p>
    </main>
  )
}

function LazyBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <LazyBoundary>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="listings" element={<ListingPage />} />
            <Route path="listings/:publicCode" element={<ListingDetailPage />} />
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/:slug" element={<ProjectDetailPage />} />
            <Route path="access-denied" element={<AccessDeniedPage />} />

            <Route element={<AnonymousRoute />}>
              <Route path="auth/login" element={<LoginPage />} />
              <Route path="auth/register" element={<RegisterPage />} />
            </Route>

            <Route element={<AuthenticatedRoute />}>
              <Route element={<AccountLayout />}>
                <Route path="account/profile" element={<ProfilePage />} />
                <Route path="account/security" element={<SecurityPage />} />
                <Route path="saved-listings" element={<SavedListingsPage />} />
              </Route>
              <Route path="seller/upgrade" element={<SellerUpgradePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route element={<SellerRoute />}>
              <Route element={<SellerLayout />}>
                <Route path="seller" element={<SellerDashboardPage />} />
                <Route path="seller/listings" element={<SellerDashboardPage />} />
                <Route path="seller/listings/new" element={<CreateListingPage />} />
                <Route path="seller/listings/:id" element={<SellerListingDetailPage />} />
                <Route path="seller/listings/:id/edit" element={<EditListingPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="admin" element={<AdminOverviewPage />} />
              <Route path="admin/listings" element={<ModerationPage />} />
              <Route path="admin/users" element={<UserManagementPage />} />
              <Route path="admin/categories" element={<CategoryManagementPage />} />
              <Route path="admin/projects" element={<ProjectManagementPage />} />
              <Route path="admin/locations" element={<LocationManagementPage />} />
            </Route>
          </Route>
        </Routes>
      </LazyBoundary>
    </BrowserRouter>
  )
}
