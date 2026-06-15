import React, { useState } from "react";

import {
  useModulesManager,
  useTranslations,
  PublishedComponent,
  baseApiUrl,
  apiHeaders,
  ProgressOrError,
  decodeId,
  TextInput
} from "@openimis/fe-core";
import { useSelector } from "react-redux";

import { Box, Grid, Button, Input, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress, Typography } from "@material-ui/core";
import { People, Autorenew as RenewIcon, Keyboard } from "@material-ui/icons";
import FeedbackIcon from "@material-ui/icons/SpeakerNotesOutlined";
import Block from "../components/Block";
import { RIGHT_EXTRACTS } from "../constants";
import { string } from "prop-types";

const EXTRACTS_URL = `${baseApiUrl}/tools/extracts`;

const OfficerDownloadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [officer, setOfficer] = useState();
  const [password, setPassword] = useState({});
  const onExtractDownload = (extract, params) => (e) => {
    const stringParams = Object.keys(params).map((k) => `${k}=${encodeURIComponent(params[k])}`)?.join("&")
    return window.open(`${EXTRACTS_URL}/download_${extract}${stringParams ? `?${stringParams}` : ""}`);
  }
  const officer_id = officer ? decodeId(officer.id) : "";

  return (
    <Block title={formatMessage("OfficerDownloadBlock.title")}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PublishedComponent
            pubRef="admin.EnrolmentOfficerPicker"
            module="admin"
            label={formatMessage("OfficerDownloadBlock.officerLabel")}
            value={officer}
            onChange={setOfficer}
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!officer} color="primary" variant="contained"
            onClick={onExtractDownload("feedbacks", { officer_id })}>
            {formatMessage("OfficerDownloadBlock.downloadFeedbacksBtn")}
          </Button>
        </Grid>
        <Grid item xs={6} align="right">
          <Button disabled={!officer} color="primary" variant="contained"
            onClick={onExtractDownload("renewals", { officer_id })}>
            {formatMessage("OfficerDownloadBlock.downloadRenewalsBtn")}
          </Button>
        </Grid>
      </Grid>
    </Block>
  );
};

const ResultDialog = ({ open, title, isLoading, children, onClose }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);

  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isLoading}>
          {formatMessage("ResultDialog.okBtn")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CustomResultDialog = ({ open, title, isLoading, children, onClose, downloadUrl }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
    onClose()
  };

  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isLoading}>
          {formatMessage("ResultDialog.okBtn")}
        </Button>
        {downloadUrl && (
          <Button
            onClick={handleDownload}
            color="primary"
            variant="contained"
            disabled={isLoading}
          >
            {formatMessage("ResultDialog.downloadBtn") || "Télécharger"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const ClaimsUploadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const { formatMessageWithValues } = useTranslations("tools.ExtractsPage", modulesManager);
  const [files, setFiles] = useState();
  const [password, setPassword] = useState("");
  const [request, setRequest] = useState();
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [imported, setImported] = useState()
  const [failed, setFailed] = useState();

  // État initial pour réinitialisation
  const initialState = {
    files: null,
    password: "",
    request: undefined
  };

  // Fonction pour réinitialiser tous les états
  const resetAllState = () => {
    setFiles(null);
    setPassword("");
    setDownloadUrl(null);
  };

  const onSubmit = async () => {
    setRequest({ isLoading: true });
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      formData.append(f.name, f);
    }
    formData.append("password", password);

    try {
      const response = await fetch(`${EXTRACTS_URL}/upload_claims`, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      const result = await response.json();
      if (response.status == 200 && result.imported) {
        setImported(result.imported);
        setFailed(0);
      } else if (response.status == 400 && result.excel_base64) {
        // Handle Excel file response
        const binaryString = atob(result.excel_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        setImported(result.imported)
        setFailed(result.failed)

        setRequest({
          isLoading: false,
          error: formatMessage("ClaimsUploadBlock.errorMessage"),
          status: response.status,
        });
      } else {
        setRequest({
          isLoading: false,
          error: formatMessage("ClaimsUploadBlock.errorMessage"),
          status: response.status,
        });
      }
    } catch (exc) {
      console.error(exc);
      setRequest({
        isLoading: false,
        error: exc.message || formatMessage("ClaimsUploadBlock.errorMessage"),
        status: 500,
      });
      setDownloadUrl(null);
    }
  };

  // Utiliser la fonction de réinitialisation complète
  const onClose = () => {
    if (downloadUrl) {
      resetAllState();
    }
    setRequest(undefined);
  };

  return (
    <Block title={formatMessage("ClaimsUploadBlock.title")}>
      {request && (
        <CustomResultDialog
          title={
            request.status === 200
              ? formatMessage("ClaimsUploadBlock.ResultDialog.title")
              : request.status === 400
                ? formatMessage("ClaimsUploadBlock.ResultDialog.error")
                : formatMessage("ClaimsUploadBlock.ResultDialog.titleOngoing")
          }
          open
          onClose={onClose}
          downloadUrl={downloadUrl}
        >
          {!request.isLoading && !request.error && downloadUrl && (
            <p>{formatMessage("ClaimsUploadBlock.ResultDialog.done")}</p>
          )}
          {!request.isLoading && request.error && downloadUrl == null && (
            <p>{formatMessage("ClaimsUploadBlock.ResultDialog.errorPassword")}</p>
          )}
          {!request.isLoading && request.error && downloadUrl && (
            <>
              <p>{formatMessage("ClaimsUploadBlock.ResultDialog.errorMessage")}</p>
              <p>{formatMessageWithValues("ClaimsUploadBlock.ResultDialog.imported", {value: imported})}</p>
              <p>{formatMessageWithValues("ClaimsUploadBlock.ResultDialog.failed", {value: failed})}</p>
            </>
          )}
          {!request.isLoading && request.status === 504 && (
            <p>{formatMessage("ClaimsUploadBlock.ResultDialog.badgatewayError")}</p>
          )}
          {request.isLoading && (
            <Box display="flex" alignItems="center">
              <CircularProgress size={24} style={{ marginRight: 16 }} />
              <Typography>{formatMessage("ClaimsUploadBlock.ResultDialog.pending")}</Typography>
            </Box>
          )}
        </CustomResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            multiple
            inputProps={{
              accept: ".xml, .zip, .rar, application/xml, text/xml",
            }}
            type="file"
            value={files ? undefined : ""}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            required
            type="password"
            label={formatMessage("password.label")}
            fullWidth
            value={password}
            onChange={(v) => setPassword(v)}
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading || password == ""} variant="contained" onClick={onSubmit}>
            <Keyboard />{formatMessage("ClaimsUploadBlock.uploadBtn")}
          </Button>
        </Grid>
      </Grid>
    </Block>
  );
};

const EnrollmentsUploadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [files, setFiles] = useState();
  const [request, setRequest] = useState();
  const onSubmit = async () => {
    setRequest({ isLoading: true });
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      formData.append(f.name, f);
    }
    try {
      const response = await fetch(`${EXTRACTS_URL}/upload_enrollments`, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      if (response.status >= 400) {
        throw new Error("Unknown error");
      }
      const payload = await response.json();
      setRequest({ isLoading: false, error: null, payload });
    } catch (exc) {
      console.error(exc);
      setRequest({ isLoading: false, error: exc.message || formatMessage("EnrollmentsUploadBlock.errorMessage") });
    } finally {
      setFiles(null);
    }
  };

  return (
    <Block title={formatMessage("EnrollmentsUploadBlock.title")}>
      {request && (
        <ResultDialog
          title={formatMessage("EnrollmentsUploadBlock.ResultDialog.title")}
          open
          onClose={() => setRequest(undefined)}
        >
          <ProgressOrError isLoading={request.isLoading} error={request.error} />
          {request?.payload?.success && formatMessage("EnrollmentsUploadBlock.ResultDialog.success")}
        </ResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            multiple
            inputProps={{
              accept: ".zip, .rar, .xml, application/zip, application/xml, text/xml",
            }}
            type="file"
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading} variant="contained" onClick={onSubmit}>
            <People />{formatMessage("EnrollmentsUploadBlock.uploadBtn")}
          </Button>
        </Grid>
      </Grid>
    </Block>
  );
};

const RenewalsUploadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [files, setFiles] = useState();
  const [request, setRequest] = useState();
  const onSubmit = async () => {
    setRequest({ isLoading: true });
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      formData.append(f.name, f);
    }
    try {
      const response = await fetch(`${EXTRACTS_URL}/upload_renewals`, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      if (response.status >= 400) {
        throw new Error("Unknown error");
      }
      const payload = await response.json();
      setRequest({ isLoading: false, error: null, payload });
    } catch (exc) {
      console.error(exc);
      setRequest({ isLoading: false, error: exc.message || formatMessage("RenewalsUploadBlock.errorMessage") });
    } finally {
      setFiles(null);
    }
  };

  return (
    <Block title={formatMessage("RenewalsUploadBlock.title")}>
      {request && (
        <ResultDialog
          title={formatMessage("RenewalsUploadBlock.ResultDialog.title")}
          open
          onClose={() => setRequest(undefined)}
        >
          <ProgressOrError isLoading={request.isLoading} error={request.error} />
          {request?.payload?.success && formatMessage("RenewalsUploadBlock.ResultDialog.success")}
        </ResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            multiple
            inputProps={{
              accept: ".zip, .rar, .xml, application/zip, application/xml, text/xml",
            }}
            type="file"
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading} variant="contained" onClick={onSubmit}>
            <RenewIcon />{formatMessage("RenewalsUploadBlock.uploadBtn")}
          </Button>
        </Grid>
      </Grid>
    </Block>
  );
};

const FeedbacksUploadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [files, setFiles] = useState();
  const [request, setRequest] = useState();
  const onSubmit = async () => {
    setRequest({ isLoading: true });
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      formData.append(f.name, f);
    }
    try {
      const response = await fetch(`${EXTRACTS_URL}/upload_feedbacks`, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      if (response.status >= 400) {
        throw new Error("Unknown error");
      }
      const payload = await response.json();
      setRequest({ isLoading: false, error: null, payload });
    } catch (exc) {
      console.error(exc);
      setRequest({ isLoading: false, error: exc.message || formatMessage("FeedbacksUploadBlock.errorMessage") });
    } finally {
      setFiles(null);
    }
  };

  return (
    <Block title={formatMessage("FeedbacksUploadBlock.title")}>
      {request && (
        <ResultDialog
          title={formatMessage("FeedbacksUploadBlock.ResultDialog.title")}
          open
          onClose={() => setRequest(undefined)}
        >
          <ProgressOrError isLoading={request.isLoading} error={request.error} />
          {request?.payload?.success && formatMessage("FeedbacksUploadBlock.ResultDialog.success")}
        </ResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            multiple
            inputProps={{
              accept: ".zip, .rar, .xml, application/zip, application/xml, text/xml",
            }}
            type="file"
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading} variant="contained" onClick={onSubmit}>
            <FeedbackIcon />{formatMessage("FeedbacksUploadBlock.uploadBtn")}
          </Button>
        </Grid>
      </Grid>
    </Block>
  );
};

const ExtractsPage = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);

  if (!RIGHT_EXTRACTS.every((x) => rights.includes(x))) {
    return null;
  }
  const EXTRACTS_URL = `${baseApiUrl}/tools/extracts`;

  const onExtractDownload = (extract) => (e) => window.open(`${EXTRACTS_URL}/download_${extract}`);

  return (
    <>
      <Box fullWidth m={2}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Block title={formatMessage("DownloadMasterData.title")}>
              <Grid container alignItems="center" justifyContent="center">
                <Button variant="contained" color="primary" onClick={onExtractDownload("master_data")}>{formatMessage("DownloadMasterData.downloadBtn")}</Button>
              </Grid>
            </Block>
          </Grid>
          <Grid item xs={4}>
            <OfficerDownloadBlock />
          </Grid>
          <Grid item xs={4}>
            <ClaimsUploadBlock />
          </Grid>
          <Grid item xs={4}>
            <EnrollmentsUploadBlock />
          </Grid>
          <Grid item xs={4}>
            <FeedbacksUploadBlock />
          </Grid>
          <Grid item xs={4}>
            <RenewalsUploadBlock />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export { ExtractsPage };
