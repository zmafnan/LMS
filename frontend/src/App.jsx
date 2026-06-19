import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import LoginPage from './modules/auth/LoginPage'
import DashboardPage from './modules/dashboard/DashboardPage'
import TasksPage from './modules/tasks/TasksPage'
import ReportsPage from './modules/reports/ReportsPage'
import MasterDataPage from './modules/master/MasterDataPage'
import MultiSkillPage from './modules/multiskill/MultiSkillPage'
import LeanMultiSkillPage from './modules/multiskill/LeanMultiSkillPage'
import DiscussionPage from './modules/discussions/DiscussionPage'

// 6S Audit Pages
import Dashboard from "./modules/audit6s/pages/Dashboard/Dashboard"
import Trend from "./modules/audit6s/pages/Dashboard/Trend"
import AdvancedDashboard from "./modules/audit6s/pages/Dashboard/AdvancedDashboard"
import Departement from "./modules/audit6s/pages/Departement/Departement"
import Schedule from "./modules/audit6s/pages/Schedule/Schedule"
import ScheduleMobile from "./modules/audit6s/pages/Schedule/Schedule-mobile"
import ProductionAudit from "./modules/audit6s/pages/ProductionAudit/ProductionAudit"
import ProductionAuditCreate from "./modules/audit6s/pages/ProductionAudit/Create"
import ProductionAuditCreateWarehouse from "./modules/audit6s/pages/ProductionAudit/CreateWarehouse"
import ProductionAuditEdit from "./modules/audit6s/pages/ProductionAudit/Edit"
import ProductionAuditPreview from "./modules/audit6s/pages/ProductionAudit/Preview"
import NonProductionAudit from "./modules/audit6s/pages/NonProductionAudit/NonProductionAudit"
import NonProductionAuditCreate from "./modules/audit6s/pages/NonProductionAudit/Create"
import NonProductionAuditEdit from "./modules/audit6s/pages/NonProductionAudit/Edit"
import NonProductionAuditPreview from "./modules/audit6s/pages/NonProductionAudit/Preview"

// Kaizen Pages
import KaizenDashboard from "./modules/kaizen/pages/Dashboard/Dashboard"
import KaizenAdmin from "./modules/kaizen/pages/KaizenAdmin/KaizenAdmin"
import KaizenAdminDetail from "./modules/kaizen/pages/KaizenAdmin/KaizenAdminDetail"
import KaizenMasterDataWeb from "./modules/kaizen/pages/KaizenMasterData/KaizenMasterDataWeb"
import KaizenMasterDataDetailWeb from "./modules/kaizen/pages/KaizenMasterData/KaizenMasterDataDetailWeb"
import KaizenRankingWeb from "./modules/kaizen/pages/KaizenRanking/KaizenRankingWeb"
import KaizenRankingMobile from "./modules/kaizen/pages/KaizenRanking/KaizenRanking"
import KaizenSubmission from "./modules/kaizen/pages/KaizenSubmission/KaizenSubmission"
import KaizenSubmissionForm from "./modules/kaizen/pages/KaizenSubmission/KaizenSubmissionForm"
import KaizenTicketConfirmation from "./modules/kaizen/pages/KaizenTicket/KaizenTicketConfirmation"
import KaizenTracking from "./modules/kaizen/pages/KaizenTracking/KaizenTracking"
import KaizenTrackingDetail from "./modules/kaizen/pages/KaizenTracking/KaizenTrackingDetail"
import KaizenMasterDataMobile from "./modules/kaizen/pages/KaizenMasterData/KaizenMasterData"
import KaizenMasterDataDetailMobile from "./modules/kaizen/pages/KaizenMasterData/KaizenMasterDataDetail"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* 6S Routes WITHOUT MainLayout */}
      <Route path="/6S/non-production-audit/create" element={<NonProductionAuditCreate />} />
      <Route path="/6S/production-audit/create" element={<ProductionAuditCreate />} />
      <Route path="/6S/production-audit/createwarehouse" element={<ProductionAuditCreateWarehouse />} />
      <Route path="/6S/Schedule/mobile" element={<ScheduleMobile />} />
      <Route path="/6S/schedule/mobile" element={<ScheduleMobile />} />

      {/* Kaizen Routes WITHOUT MainLayout (Public/Mobile) */}
      <Route path="/kaizen/submission" element={<KaizenSubmission />} />
      <Route path="/kaizen/submission/form" element={<KaizenSubmissionForm />} />
      <Route path="/kaizen/submission/form/:ticket" element={<KaizenSubmissionForm />} />
      <Route path="/kaizen/ticket/:ticket" element={<KaizenTicketConfirmation />} />
      <Route path="/kaizen/tracking" element={<KaizenTracking />} />
      <Route path="/kaizen/tracking/:ticket" element={<KaizenTrackingDetail />} />
      <Route path="/kaizen/rankings" element={<KaizenRankingMobile />} />
      <Route path="/kaizen/master-data" element={<KaizenMasterDataMobile />} />
      <Route path="/kaizen/master-data/:id" element={<KaizenMasterDataDetailMobile />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/master" element={<MasterDataPage />} />
        <Route path="/multiskill" element={<MultiSkillPage />} />
        <Route path="/lean-multiskill" element={<LeanMultiSkillPage />} />
        <Route path="/discussions" element={<DiscussionPage />} />

        {/* 6S Routes WITH MainLayout */}
        <Route path="/6S/dashboard" element={<Dashboard />} />
        <Route path="/6S/trend" element={<Trend />} />
        <Route path="/6S/advanced-dashboard" element={<AdvancedDashboard />} />
        <Route path="/6S/departement" element={<Departement />} />
        <Route path="/6S/schedule" element={<Schedule />} />
        <Route path="/6S/production-audit" element={<ProductionAudit />} />
        <Route path="/6S/production-audit/edit/:id" element={<ProductionAuditEdit />} />
        <Route path="/6S/production-audit/preview/:id" element={<ProductionAuditPreview />} />
        <Route path="/6S/non-production-audit" element={<NonProductionAudit />} />
        <Route path="/6S/non-production-audit/edit/:id" element={<NonProductionAuditEdit />} />
        <Route path="/6S/non-production-audit/preview/:id" element={<NonProductionAuditPreview />} />

        {/* Kaizen Routes WITH MainLayout (Admin/Desktop) */}
        <Route path="/kaizen/dashboard" element={<KaizenDashboard />} />
        <Route path="/kaizen/admin" element={<KaizenAdmin />} />
        <Route path="/kaizen/admin/:id" element={<KaizenAdminDetail />} />
        <Route path="/kaizen/rankingsweb" element={<KaizenRankingWeb />} />
        <Route path="/kaizen/master-data-web" element={<KaizenMasterDataWeb />} />
        <Route path="/kaizen/master-data-web/:id" element={<KaizenMasterDataDetailWeb />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

