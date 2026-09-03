import { useState, useEffect } from "react";
import { apiPost, apiPut, apiGet } from "../services/api";
import { MODULE_FIELDS } from "../services/moduleFields";

function AddRecordModal({ moduleKey, onClose, onSuccess, editData }) {
  const fields = MODULE_FIELDS[moduleKey] || [];
  const isEdit = !!editData;

  const [formData, setFormData] = useState(editData || {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lookupData, setLookupData] = useState({});

  useEffect(() => {
    const lookupFields = fields.filter((f) => f.type === "lookup");
    lookupFields.forEach(async (field) => {
      try {
        const result = await apiGet(`/${field.lookupModule}`);
        setLookupData((prev) => ({ ...prev, [field.lookupModule]: result }));
      } catch (err) {
        // ignore
      }
    });
    // eslint-disable-next-line
  }, []);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {};

      fields.forEach((field) => {
        let value = formData[field.key];

        if (field.type === "boolean") {
          payload[field.key] = value === true || value === "true";
        } else if (field.type === "number" || field.type === "lookup") {
          payload[field.key] = value === undefined || value === "" ? null : Number(value);
        } else {
          payload[field.key] = value ?? "";
        }
      });

      if (isEdit) {
        await apiPut(`/${moduleKey}/${editData.id}`, payload);
      } else {
        await apiPost(`/${moduleKey}`, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Record" : "Add New Record"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label>{field.label}</label>

              {field.type === "textarea" && (
                <textarea
                  defaultValue={formData[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}

              {field.type === "select" && (
                <select
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  defaultValue={formData[field.key] ?? ""}
                >
                  <option value="" disabled>Select {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {field.type === "lookup" && (
                <select
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  defaultValue={formData[field.key] ?? ""}
                >
                  <option value="" disabled>Select {field.label}</option>
                  {(lookupData[field.lookupModule] || []).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "boolean" && (
                <select
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  defaultValue={String(formData[field.key] ?? "true")}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              )}

              {["text", "number", "date", "time"].includes(field.type) && (
                <input
                  type={field.type}
                  defaultValue={formData[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Record" : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRecordModal;