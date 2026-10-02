import { useState, useEffect } from "react";
import {
  apiPost,
  apiPut,
  apiGet,
} from "../services/api";

import { MODULE_FIELDS } from "../services/moduleFields";

function AddRecordModal({
  moduleKey,
  onClose,
  onSuccess,
  editData,
}) {
  const fields =
    MODULE_FIELDS[moduleKey] || [];

  const isEdit = !!editData;

  const [formData, setFormData] =
    useState(editData || {});

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [lookupData, setLookupData] =
    useState({});

  useEffect(() => {

    setFormData(editData || {});
    setError("");

  }, [editData]);

  useEffect(() => {

    const loadLookups = async () => {

      const lookupFields =
        fields.filter(
          (field) =>
            field.type === "lookup"
        );

      for (const field of lookupFields) {

        try {

          const result =
            await apiGet(
              `/${field.lookupModule}`
            );

          setLookupData(
            (previous) => ({
              ...previous,
              [field.lookupModule]:
                Array.isArray(result)
                  ? result
                  : [],
            })
          );

        } catch (err) {

          console.error(
            `Failed to load ${field.lookupModule}`,
            err
          );
        }
      }
    };

    loadLookups();

    // eslint-disable-next-line
  }, [moduleKey]);

  const handleChange = (
    key,
    value
  ) => {

    setFormData(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    setError("");
  };

  const validateForm = () => {

    /*
     * ==========================================================
     * EMPLOYEE VALIDATION
     * ==========================================================
     */

    if (moduleKey === "employees") {

      if (
        !formData.employeeCode ||
        !formData.employeeCode.trim()
      ) {
        return "Employee Code is required";
      }

      if (
        !formData.firstName ||
        !formData.firstName.trim()
      ) {
        return "First Name is required";
      }

      if (
        !formData.email ||
        !formData.email.trim()
      ) {
        return "Email is required";
      }

      const emailRegex =
        /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;

      if (
        !emailRegex.test(
          formData.email.trim()
        )
      ) {
        return "Please enter a valid email address";
      }
    }

    /*
     * ==========================================================
     * ATTENDANCE VALIDATION
     * ==========================================================
     */

    if (moduleKey === "attendance") {

      if (
        formData.employeeId ===
          undefined ||
        formData.employeeId === null ||
        formData.employeeId === ""
      ) {
        return "Employee is required";
      }

      if (
        !formData.attendanceDate
      ) {
        return "Attendance Date is required";
      }

      if (!formData.checkIn) {
        return "Punch In is required";
      }

      if (!formData.checkOut) {
        return "Punch Out is required";
      }

      if (
        formData.checkIn &&
        formData.checkOut &&
        formData.checkIn ===
          formData.checkOut
      ) {
        return "Punch In and Punch Out cannot be the same";
      }

      /*
       * Manual Shift validation.
       */
      if (
        formData.shiftSource ===
          "MANUAL" &&
        !formData.shiftCode
      ) {
        return "Please select Manual Shift";
      }

      if (
        formData.remarks &&
        formData.remarks.length > 500
      ) {
        return "Remarks cannot exceed 500 characters";
      }
    }

    return "";
  };

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {

      setError(
        validationError
      );

      return;
    }

    setSaving(true);

    try {

      const payload = {};

      fields.forEach(
        (field) => {

          let value =
            formData[field.key];

          /*
           * ====================================================
           * ATTENDANCE AUTO FIELDS
           * ====================================================
           *
           * Backend calculates:
           *
           * Shift Name
           * Working Hours
           * Overtime
           * Status
           *
           * But Shift Source + Manual Shift
           * are sent when selected.
           */

          if (
            moduleKey ===
              "attendance" &&
            (
              field.key ===
                "workingHours" ||
              field.key ===
                "shiftName" ||
              field.key ===
                "overtimeHours" ||
              field.key ===
                "status"
            )
          ) {
            return;
          }

          /*
           * Shift Source
           */
          if (
            moduleKey ===
              "attendance" &&
            field.key ===
              "shiftSource"
          ) {

            payload.shiftSource =
              value === "MANUAL"
                ? "MANUAL"
                : "AUTO";

            return;
          }

          /*
           * Manual Shift Code
           *
           * Only send shiftCode when
           * Manual mode is selected.
           */
          if (
            moduleKey ===
              "attendance" &&
            field.key ===
              "shiftCode"
          ) {

            if (
              formData.shiftSource ===
                "MANUAL"
            ) {

              payload.shiftCode =
                value || "";

            } else {

              payload.shiftCode =
                null;
            }

            return;
          }

          if (
            field.type ===
            "boolean"
          ) {

            payload[field.key] =
              value === true ||
              value === "true";

          } else if (
            field.type ===
              "number" ||
            field.type ===
              "lookup"
          ) {

            payload[field.key] =
              value ===
                undefined ||
              value === "" ||
              value === null
                ? null
                : Number(value);

          } else {

            payload[field.key] =
              typeof value ===
                "string"
                ? value.trim()
                : value ?? "";
          }
        }
      );

      /*
       * ========================================================
       * ATTENDANCE FINAL PAYLOAD
       * ========================================================
       */

      if (
        moduleKey ===
        "attendance"
      ) {

        delete payload.status;
        delete payload.workingHours;
        delete payload.shiftName;
        delete payload.overtimeHours;

        /*
         * AUTO mode must not send
         * manual shift code.
         */
        if (
          payload.shiftSource !==
          "MANUAL"
        ) {

          payload.shiftSource =
            "AUTO";

          payload.shiftCode =
            null;
        }
      }

      /*
       * ========================================================
       * SAVE
       * ========================================================
       */

      if (isEdit) {

        await apiPut(
          `/${moduleKey}/${editData.id}`,
          payload
        );

      } else {

        await apiPost(
          `/${moduleKey}`,
          payload
        );
      }

      await onSuccess();

      onClose();

    } catch (err) {

      setError(
        err.message ||
        "Failed to save record"
      );

    } finally {

      setSaving(false);
    }
  };

  const getModalTitle = () => {

    if (
      moduleKey ===
      "employees"
    ) {

      return isEdit
        ? "Edit Employee"
        : "Add Employee";
    }

    if (
      moduleKey ===
      "attendance"
    ) {

      return isEdit
        ? "Edit Attendance"
        : "Add Attendance";
    }

    if (
      moduleKey ===
      "departments"
    ) {

      return isEdit
        ? "Edit Department"
        : "Add Department";
    }

    if (
      moduleKey ===
      "designations"
    ) {

      return isEdit
        ? "Edit Designation"
        : "Add Designation";
    }

    if (
      moduleKey ===
      "leaves"
    ) {

      return isEdit
        ? "Edit Leave"
        : "Add Leave";
    }

    if (
      moduleKey ===
      "payroll"
    ) {

      return isEdit
        ? "Edit Payroll"
        : "Add Payroll";
    }

    if (
      moduleKey ===
      "expenses"
    ) {

      return isEdit
        ? "Edit Expense"
        : "Add Expense";
    }

    if (
      moduleKey ===
      "candidates"
    ) {

      return isEdit
        ? "Edit Candidate"
        : "Add Candidate";
    }

    if (
      moduleKey ===
      "interviews"
    ) {

      return isEdit
        ? "Edit Interview"
        : "Add Interview";
    }

    if (
      moduleKey ===
      "job-positions"
    ) {

      return isEdit
        ? "Edit Job Position"
        : "Add Job Position";
    }

    if (
      moduleKey ===
      "performance-reviews"
    ) {

      return isEdit
        ? "Edit Performance Review"
        : "Add Performance Review";
    }

    if (
      moduleKey ===
      "employee-documents"
    ) {

      return isEdit
        ? "Edit Employee Document"
        : "Add Employee Document";
    }

    return isEdit
      ? "Edit Record"
      : "Add New Record";
  };

  const getSaveButtonText = () => {

    if (saving) {
      return "Saving...";
    }

    if (isEdit) {

      if (
        moduleKey ===
        "attendance"
      ) {
        return "Update Attendance";
      }

      if (
        moduleKey ===
        "employees"
      ) {
        return "Update Employee";
      }

      return "Update Record";
    }

    if (
      moduleKey ===
      "attendance"
    ) {
      return "Save Attendance";
    }

    if (
      moduleKey ===
      "employees"
    ) {
      return "Save Employee";
    }

    return "Save Record";
  };

  const getLookupLabel = (
    field,
    option
  ) => {

    if (
      field.lookupModule ===
      "employees"
    ) {

      const employeeCode =
        option.employeeCode
          ? ` (${option.employeeCode})`
          : "";

      return `${option.firstName || ""} ${
        option.lastName || ""
      }${employeeCode}`.trim();
    }

    return (
      option.name ||
      option.id
    );
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="modal-box"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="modal-header">

          <h2>
            {getModalTitle()}
          </h2>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            ×
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="modal-form"
        >

          {fields.map(
            (field) => {

              /*
               * =================================================
               * HIDE AUTO GENERATED FIELDS
               * =================================================
               */

              if (
                moduleKey ===
                  "attendance" &&
                (
                  field.key ===
                    "shiftName" ||
                  field.key ===
                    "workingHours" ||
                  field.key ===
                    "overtimeHours" ||
                  field.key ===
                    "status"
                )
              ) {

                return null;
              }

              /*
               * Shift Code is only shown
               * for MANUAL mode.
               */
              if (
                moduleKey ===
                  "attendance" &&
                field.key ===
                  "shiftCode" &&
                formData.shiftSource !==
                  "MANUAL"
              ) {

                return null;
              }

              return (
                <div
                  className="form-group"
                  key={field.key}
                >

                  <label>

                    {field.label}

                    {(
                      moduleKey ===
                        "employees" &&
                      [
                        "employeeCode",
                        "firstName",
                        "email",
                      ].includes(
                        field.key
                      )
                    ) && (

                      <span
                        style={{
                          color:
                            "red",
                          marginLeft:
                            "4px",
                        }}
                      >
                        *
                      </span>
                    )}

                    {(
                      moduleKey ===
                        "attendance" &&
                      [
                        "employeeId",
                        "attendanceDate",
                        "checkIn",
                        "checkOut",
                      ].includes(
                        field.key
                      )
                    ) && (

                      <span
                        style={{
                          color:
                            "red",
                          marginLeft:
                            "4px",
                        }}
                      >
                        *
                      </span>
                    )}

                    {(
                      moduleKey ===
                        "attendance" &&
                      field.key ===
                        "shiftCode" &&
                      formData.shiftSource ===
                        "MANUAL"
                    ) && (

                      <span
                        style={{
                          color:
                            "red",
                          marginLeft:
                            "4px",
                        }}
                      >
                        *
                      </span>
                    )}

                  </label>

                  {/*
                   * =================================================
                   * TEXTAREA
                   * =================================================
                   */}

                  {field.type ===
                    "textarea" && (

                    <textarea
                      value={
                        formData[
                          field.key
                        ] ?? ""
                      }
                      onChange={(
                        event
                      ) =>
                        handleChange(
                          field.key,
                          event.target
                            .value
                        )
                      }
                      rows={3}
                      maxLength={
                        moduleKey ===
                          "attendance" &&
                        field.key ===
                          "remarks"
                          ? 500
                          : undefined
                      }
                    />
                  )}

                  {/*
                   * =================================================
                   * SELECT
                   * =================================================
                   */}

                  {field.type ===
                    "select" && (

                    <select
                      value={
                        formData[
                          field.key
                        ] ?? ""
                      }
                      onChange={(
                        event
                      ) => {

                        const value =
                          event.target
                            .value;

                        handleChange(
                          field.key,
                          value
                        );

                        /*
                         * Switching to AUTO
                         * clears manual shift.
                         */
                        if (
                          moduleKey ===
                            "attendance" &&
                          field.key ===
                            "shiftSource" &&
                          value ===
                            "AUTO"
                        ) {

                          setFormData(
                            (
                              previous
                            ) => ({
                              ...previous,
                              shiftSource:
                                "AUTO",
                              shiftCode:
                                "",
                            })
                          );
                        }
                      }}
                    >

                      <option value="">
                        Select {field.label}
                      </option>

                      {(
                        field.options ||
                        []
                      ).map(
                        (option) => (

                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {moduleKey ===
                              "attendance" &&
                            field.key ===
                              "shiftCode"
                              ? getShiftLabel(
                                  option
                                )
                              : option}
                          </option>

                        )
                      )}

                    </select>
                  )}

                  {/*
                   * =================================================
                   * LOOKUP
                   * =================================================
                   */}

                  {field.type ===
                    "lookup" && (

                    <select
                      value={
                        formData[
                          field.key
                        ] ?? ""
                      }
                      onChange={(
                        event
                      ) =>
                        handleChange(
                          field.key,
                          event.target
                            .value
                        )
                      }
                    >

                      <option value="">
                        Select {field.label}
                      </option>

                      {(
                        lookupData[
                          field
                            .lookupModule
                        ] || []
                      ).map(
                        (option) => (

                          <option
                            key={
                              option.id
                            }
                            value={
                              option.id
                            }
                          >
                            {getLookupLabel(
                              field,
                              option
                            )}
                          </option>

                        )
                      )}

                    </select>
                  )}

                  {/*
                   * =================================================
                   * BOOLEAN
                   * =================================================
                   */}

                  {field.type ===
                    "boolean" && (

                    <select
                      value={String(
                        formData[
                          field.key
                        ] ??
                        "true"
                      )}
                      onChange={(
                        event
                      ) =>
                        handleChange(
                          field.key,
                          event.target
                            .value
                        )
                      }
                    >

                      <option value="true">
                        Yes
                      </option>

                      <option value="false">
                        No
                      </option>

                    </select>
                  )}

                  {/*
                   * =================================================
                   * INPUT
                   * =================================================
                   */}

                  {[
                    "text",
                    "number",
                    "date",
                    "time",
                  ].includes(
                    field.type
                  ) && (

                    <input
                      type={
                        field.type
                      }
                      value={
                        formData[
                          field.key
                        ] ?? ""
                      }
                      onChange={(
                        event
                      ) =>
                        handleChange(
                          field.key,
                          event.target
                            .value
                        )
                      }
                      step={
                        moduleKey ===
                          "attendance" &&
                        (
                          field.key ===
                            "checkIn" ||
                          field.key ===
                            "checkOut"
                        )
                          ? 900
                          : field.type ===
                              "number" &&
                            field.key ===
                              "workingHours"
                          ? "0.01"
                          : undefined
                      }
                    />
                  )}

                </div>
              );
            }
          )}

          {/*
           * =========================================================
           * ATTENDANCE INFORMATION
           * =========================================================
           */}

          {moduleKey ===
            "attendance" && (

            <div
              style={{
                padding:
                  "12px 14px",
                borderRadius:
                  "8px",
                background:
                  "#f5f5f5",
                fontSize:
                  "13px",
                lineHeight:
                  "1.6",
              }}
            >

              <strong>
                Attendance Calculation
              </strong>

              <br />

              <span>
                AUTO = Shift will be detected
                from Punch In / Punch Out.
              </span>

              <br />

              <span>
                MANUAL = Admin can select
                the employee's shift.
              </span>

              <br />

              <span>
                Working Hours, Overtime and
                Status are calculated automatically.
              </span>

              <br />

              <span>
                Punch time should normally
                be in 15-minute intervals.
              </span>

            </div>
          )}

          {error && (

            <div className="error">
              {error}
            </div>

          )}

          <div
            className="modal-actions"
          >

            <button
              type="button"
              className="back-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
            >
              {getSaveButtonText()}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/*
 * ================================================================
 * SHIFT LABEL
 * ================================================================
 */

function getShiftLabel(
  code
) {

  const labels = {

    P1:
      "First (P1)",

    P2:
      "Second (P2)",

    P3:
      "Third / Night (P3)",

    G:
      "General (G)",

    "P3-12D":
      "12 Hr Day (P3-12D)",

    P4:
      "12 Hr Night (P4)",

    "P1-P2":
      "First + Second (P1-P2)",

    "P2-P3":
      "Second + Night (P2-P3)",

    "P3-P1":
      "Night + First (P3-P1)",
  };

  return (
    labels[code] ||
    code
  );
}

export default AddRecordModal;