import React, { useState } from "react";

import {
  useModulesManager,
  useTranslations,
  PublishedComponent,
  baseApiUrl,
  apiHeaders,
  ProgressOrError,
  decodeId,
} from "@openimis/fe-core";
import { useSelector } from "react-redux";

import { Box, Grid, Button, Input, Dialog, DialogContent, DialogTitle, DialogActions } from "@material-ui/core";
import { People, Autorenew as RenewIcon, Keyboard } from "@material-ui/icons";
import FeedbackIcon from "@material-ui/icons/SpeakerNotesOutlined";
import Block from "../components/Block";
import { RIGHT_EXTRACTS } from "../constants";
import { string } from "prop-types";

const EXTRACTS_URL = `${baseApiUrl}/tools/extracts`;
const BANK_URL = `${baseApiUrl}/im_export/imports`;

const OfficerDownloadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [officer, setOfficer] = useState();
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
    <Dialog open={open}
      fullWidth
      maxWidth="xl">
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

const ClaimsUploadBlock = (props) => {
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
      const response = await fetch(`${EXTRACTS_URL}/upload_claims`, {
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
      setRequest({ isLoading: false, error: exc.message || formatMessage("ClaimsUploadBlock.errorMessage") });
    } finally {
      setFiles(null);
    }
  };

  return (
    <Block title={formatMessage("ClaimsUploadBlock.title")}>
      {request && (
        <ResultDialog
          title={formatMessage("ClaimsUploadBlock.ResultDialog.title")}
          open
          onClose={() => setRequest(undefined)}
        >
          <ProgressOrError isLoading={request.isLoading} error={request.error} />
          {request?.payload?.success && formatMessage("ClaimsUploadBlock.ResultDialog.success")}
        </ResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            multiple
            inputProps={{
              accept: ".xml, application/xml, text/xml",
            }}
            type="file"
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading} variant="contained" onClick={onSubmit}>
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

const EximBankUploadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [files, setFiles] = useState();
  const [request, setRequest] = useState();
  const onSubmit = async () => {
    setRequest({ isLoading: true });
    const formData = new FormData();
    const f = files.item(0);
    formData.append("file", f);
    try {
      const response = await fetch(`${BANK_URL}/exim_bank`, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      const responseBody = await response.json();
      if (response.status >= 400) {
        setRequest({ isLoading: false, errors: responseBody.errors, payload: responseBody });
      } else {
        setRequest({ isLoading: false, error: null, payload: responseBody });
      }
    } catch (exc) {
      console.error(exc);
      //setRequest({ isLoading: false, error: exc.message || formatMessage("EximBankUploadBlock.errorMessage") });
    } finally {
      setFiles(null);
    }
  };

  return (
    <Block title={formatMessage("EximBankUploadBlock.title")}>
      {request && (
        <ResultDialog
          title={formatMessage("BdcBankUploadBlock.ResultDialog.title")}
          open
          onClose={() => setRequest(undefined)}
        >
          <ProgressOrError isLoading={request.isLoading} error={request.error} />

          {!!request.payload && (
            <>
              {request.payload.success && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  {formatMessage("BdcBankUploadBlock.ResultDialog.success")}
                </p>
              )}

              <p><strong>{formatMessage("BdcBankUploadBlock.ResultDialog.totalTransaction")} :</strong> {request.payload.transactions.length}</p>
              <p><strong>{formatMessage("BdcBankUploadBlock.ResultDialog.totalKmf")} : </strong> {request.payload.total_kmf}</p>

              {request.payload.processed.length ? (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.#")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.chfID")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.amount")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.status")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.invoiceCode")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.paiementId")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.completed")}</th>
                  </tr>
                </thead>
                <tbody>
                  {request.payload.processed.map((tx, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{index + 1}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.insuree_chf_id}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.amount}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.status}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.invoice_code || "N/A"}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.payment_id || "N/A"}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{!!tx.complete  ? ( tx.complete).toString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>) : null}

              {/* Liste des erreurs en dessous du tableau */}
              {request.errors?.length > 0 && (
                <ul style={{ color: "red" }}>
                  {request.errors.map((str, index) => (
                    <li key={index}>{str}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </ResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            inputProps={{
              accept: ".xlsx, application/xlsx, text/xlsx",
            }}
            type="file"
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading} variant="contained" onClick={onSubmit}>
            <Keyboard />{formatMessage("EximBankUploadBlock.uploadBtn")}
          </Button>
        </Grid>
      </Grid>
    </Block>
  );
};

const BdcBankUploadBlock = (props) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("tools.ExtractsPage", modulesManager);
  const [files, setFiles] = useState();
  const [request, setRequest] = useState();
  const onSubmit = async () => {
    setRequest({ isLoading: true });
    const formData = new FormData();
    const f = files.item(0);
    formData.append("file", f);
    try {
      const response = await fetch(`${BANK_URL}/bdc_bank`, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      const responseBody = await response.json();
      if (response.status >= 400) {
        setRequest({ isLoading: false, errors: responseBody.errors, payload: responseBody });
      } else {
        setRequest({ isLoading: false, error: null, payload: responseBody });
      }
    } catch (exc) {
      console.error(exc);
      //setRequest({ isLoading: false, error: exc.message || formatMessage("bdcBankUpload.errorMessage") });
    } finally {
      setFiles(null);
    }
  };

  return (
    <Block title={formatMessage("BdcBankUploadBlock.title")}>
      {request && (
        <ResultDialog
          title={formatMessage("BdcBankUploadBlock.ResultDialog.title")}
          open
          onClose={() => setRequest(undefined)}
        >
          <ProgressOrError isLoading={request.isLoading} error={request.error} />

          {!!request.payload && (
            <>
              {request.payload.success && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  {formatMessage("BdcBankUploadBlock.ResultDialog.success")}
                </p>
              )}

              <p><strong>{formatMessage("BdcBankUploadBlock.ResultDialog.totalTransaction")} :</strong> {request.payload.transactions.length}</p>
              <p><strong>{formatMessage("BdcBankUploadBlock.ResultDialog.totalKmf")} : </strong> {request.payload.total_kmf}</p>

              {request.payload.processed.length ? (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.#")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.chfID")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.amount")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.status")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.invoiceCode")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.paiementId")}</th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{formatMessage("BdcBankUploadBlock.ResultDialog.completed")}</th>
                  </tr>
                </thead>
                <tbody>
                  {request.payload.processed.map((tx, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{index + 1}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.insuree_chf_id}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.amount}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.status}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.invoice_code || "N/A"}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{tx.payment_id || "N/A"}</td>
                      <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{(tx.complete).toString() || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>) : null}

              {/* Liste des erreurs en dessous du tableau */}
              {request.errors?.length > 0 && (
                <ul style={{ color: "red" }}>
                  {request.errors.map((str, index) => (
                    <li key={index}>{str}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </ResultDialog>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input
            onChange={(event) => setFiles(event.target.files)}
            required
            inputProps={{
              accept: ".xlsx, application/xlsx, text/xlsx",
            }}
            type="file"
          />
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!files || request?.isLoading} variant="contained" onClick={onSubmit}>
            <Keyboard />{formatMessage("BdcBankUploadBlock.uploadBtn")}
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
          <Grid item xs={4}>
            <EximBankUploadBlock />
          </Grid>
          <Grid item xs={4}>
            <BdcBankUploadBlock />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export { ExtractsPage };
