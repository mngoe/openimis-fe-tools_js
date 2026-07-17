import ToolsMainMenu from "./components/ToolsMainMenu";
import RegistersPage from "./pages/RegistersPage";
import { PolicyRenewalsPage } from "./pages/PolicyRenewalsPage";
import { FeedbackPromptsPage } from "./pages/FeedbackPromptsPage";
import { ExtractsPage } from "./pages/ExtractsPage";
import { UtilitiesPage } from "./pages/UtilitiesPage";
import { EmailSettingsPage } from "./pages/EmailSettingsPage";
import ReportsPage from "./pages/ReportsPage";

import messages_en from "./translations/en.json";

import ReportDefinitionEditorDialog from "./components/ReportDefinitionEditorDialog";
import ReportPicker from "./components/ReportPicker";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "refs": [
    { key: "tools.reports", ref: "tools/reports" },
    { key: "tools.ReportDefinitionEditorDialog", ref: ReportDefinitionEditorDialog },
    { key: "tools.ReportPicker", ref: ReportPicker },
  ],
  "core.Router": [
    { path: "tools/registers", component: RegistersPage },
    { path: "tools/policyRenewals", component: PolicyRenewalsPage },
    { path: "tools/feedbackPrompts", component: FeedbackPromptsPage },
    { path: "tools/extracts", component: ExtractsPage },
    { path: "tools/reports", component: ReportsPage },
    { path: "tools/utilities", component: UtilitiesPage },
    { path: "tools/emailSettings", component: EmailSettingsPage },
  ],
  "core.MainMenu": [ToolsMainMenu],
};

export const ToolsModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};
