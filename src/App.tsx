import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { DataSyncProvider } from "./contexts/DataSyncContext";
import { setupGlobalErrorHandling } from "./utils/errorHandler";
import Index from "./pages/Index";
import LMSPage from "./pages/LMS";
import AITutorPage from "./pages/AITutor";
import ProfilePage from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CourseDeleter from "./components/CourseDeleter";
import NextButtonTest from "./components/NextButtonTest";
import FundiStudentLoans from "./pages/FundiStudentLoans";
import Gallery from "./pages/Gallery";
import AssessmentCentre from "./pages/AssessmentCentre";
import Careers from "./pages/Careers";
import Courses from "./pages/Courses";
import AboutUs from "./pages/AboutUs";
import RPL from "./pages/RPL";
import { ContactPage } from "./components/ContactPage";
import FunnelLanding from "./pages/funnel/FunnelLanding";
import FunnelCheckout from "./pages/funnel/FunnelCheckout";
import FunnelSuccess from "./pages/funnel/FunnelSuccess";
import FunnelCancel from "./pages/funnel/FunnelCancel";
import FunnelAbout from "./pages/funnel/FunnelAbout";
import FunnelContact from "./pages/funnel/FunnelContact";
import FunnelBlog from "./pages/funnel/FunnelBlog";
import FunnelBlogPost from "./pages/funnel/FunnelBlogPost";
import FunnelLogin from "./pages/funnel/FunnelLogin";
import FunnelDashboard from "./pages/funnel/FunnelDashboard";
import SetPassword from "./pages/SetPassword";
import LMSCheckout from "./pages/LMSCheckout";

const queryClient = new QueryClient();

// Setup global error handling to suppress AbortErrors
setupGlobalErrorHandling();

/** True when served from the revolearn.co.za domain (funnel-only brand site). */
const isRevolearnDomain =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'revolearn.co.za' ||
    window.location.hostname.endsWith('.revolearn.co.za'));

/** Funnel pages at their canonical /funnel/* paths (used on every domain). */
const FunnelRoutes = (
  <>
    <Route path="/funnel" element={<FunnelLanding />} />
    <Route path="/funnel/about" element={<FunnelAbout />} />
    <Route path="/funnel/contact" element={<FunnelContact />} />
    <Route path="/funnel/blog" element={<FunnelBlog />} />
    <Route path="/funnel/blog/:slug" element={<FunnelBlogPost />} />
    <Route path="/funnel/login" element={<FunnelLogin />} />
    <Route path="/funnel/dashboard" element={<FunnelDashboard />} />
    <Route path="/funnel/checkout/:courseId" element={<FunnelCheckout />} />
    <Route path="/funnel/success" element={<FunnelSuccess />} />
    <Route path="/funnel/cancel" element={<FunnelCancel />} />
  </>
);

/** Root-level aliases so revolearn.co.za serves the funnel at its own URL. */
const RevolearnRootRoutes = (
  <>
    <Route path="/" element={<FunnelLanding />} />
    <Route path="/about" element={<FunnelAbout />} />
    <Route path="/contact" element={<FunnelContact />} />
    <Route path="/blog" element={<FunnelBlog />} />
    <Route path="/blog/:slug" element={<FunnelBlogPost />} />
    <Route path="/login" element={<FunnelLogin />} />
    <Route path="/dashboard" element={<FunnelDashboard />} />
    <Route path="/checkout/:courseId" element={<FunnelCheckout />} />
    <Route path="/success" element={<FunnelSuccess />} />
    <Route path="/cancel" element={<FunnelCancel />} />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <DataSyncProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {isRevolearnDomain ? (
                  <>
                    {RevolearnRootRoutes}
                    {FunnelRoutes}
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="*" element={<FunnelLanding />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<Index />} />
                    <Route path="/lms" element={<LMSPage />} />
                    <Route path="/lms/checkout/:courseId" element={<LMSCheckout />} />
                    <Route path="/ai-tutor" element={<AITutorPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/rpl" element={<RPL />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/blog" element={<FunnelBlog />} />
                    <Route path="/blog/:slug" element={<FunnelBlogPost />} />
                    <Route path="/fundi-student-loans" element={<FundiStudentLoans />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/assessment-centre" element={<AssessmentCentre />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/contact" element={<ContactPage />} />
                    {FunnelRoutes}
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/delete-courses" element={<CourseDeleter />} />
                    <Route path="/test-next-button" element={<NextButtonTest />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </>
                )}
              </Routes>
            </BrowserRouter>
          </DataSyncProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
