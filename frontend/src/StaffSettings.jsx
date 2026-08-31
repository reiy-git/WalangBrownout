import { useState } from "react";


const defaultForm = {
  username: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// Small inline icons, matching the stroke style used elsewhere in the app
const icons = {
  user: (
    <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12z M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="#9a8cc2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  ),
  mail: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="#9a8cc2" strokeWidth="1.5" fill="none" />
      <path d="M5 7.5L12 13L19 7.5" stroke="#9a8cc2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9a8cc2" strokeWidth="1.5" fill="none" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9a8cc2" strokeWidth="1.5" fill="none" />
    </>
  ),
  save: (
    <>
      <path d="M5 4h11l3 3v13H5V4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M8 4v5h7V4M8 20v-6h8v6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </>
  ),
  reset: (
    <path d="M4 12a8 8 0 0113.66-5.66M20 12a8 8 0 01-13.66 5.66M4 6v4h4M20 18v-4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  cancel: (
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  ),
};

function Icon({ path, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      {path}
    </svg>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-violet-900/80 mb-0.5 block">{label}</label>
      <div className="input input-sm w-full flex items-center gap-2 h-8 px-2.5">
        {icon && <Icon path={icon} />}
        {children}
      </div>
    </div>
  );
}

export default function StaffSettings({ username = "", email = "", onSave, onCancel }) {
  const initialForm = { ...defaultForm, username, email };
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
    setSavedMessage("");
  };

  const handleReset = () => {
    setForm(initialForm);
    setError("");
    setSavedMessage("");
  };

  const handleCancel = () => {
    setForm(initialForm);
    setError("");
    setSavedMessage("");
    if (onCancel) onCancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const wantsPasswordChange = form.newPassword || form.confirmPassword || form.currentPassword;
    if (wantsPasswordChange) {
      if (!form.currentPassword) {
        setError("Enter your current password to change it.");
        return;
      }
      if (form.newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError("New password and confirmation don't match.");
        return;
      }
    }

    setError("");
    setSavedMessage("Settings saved.");
    if (onSave) {
      onSave({ username: form.username, email: form.email, newPassword: form.newPassword || undefined });
    }
    setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-base font-medium text-violet-950">Settings</h1>
        <p className="text-[11px] text-violet-800/70 mb-4">
          Manage your account settings and preferences
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Account Settings card */}
            <div className="card card-sm flex-1 w-full bg-violet-50/90 shadow-md rounded-xl">
              <div className="card-body p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Icon path={icons.user} size={16} />
                  <p className="text-[11px] font-semibold text-violet-900">Account Settings</p>
                </div>

                <div className="flex flex-col gap-2.5 text-left">
                  <Field label="Username" icon={icons.user}>
                    <input
                      type="text"
                      className="grow min-w-0 text-xs"
                      value={form.username}
                      onChange={handleChange("username")}
                      autoComplete="username"
                    />
                  </Field>

                  <Field label="Email" icon={icons.mail}>
                    <input
                      type="email"
                      className="grow min-w-0 text-xs"
                      value={form.email}
                      onChange={handleChange("email")}
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Current Password" icon={icons.lock}>
                    <input
                      type="password"
                      className="grow min-w-0 text-xs"
                      value={form.currentPassword}
                      onChange={handleChange("currentPassword")}
                      autoComplete="current-password"
                      placeholder="Required to change password"
                    />
                  </Field>

                  <Field label="New Password" icon={icons.lock}>
                    <input
                      type="password"
                      className="grow min-w-0 text-xs"
                      value={form.newPassword}
                      onChange={handleChange("newPassword")}
                      autoComplete="new-password"
                    />
                  </Field>

                  <Field label="Confirm Password" icon={icons.lock}>
                    <input
                      type="password"
                      className="grow min-w-0 text-xs"
                      value={form.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      autoComplete="new-password"
                    />
                  </Field>

                  {error && <p className="text-error text-[11px]">{error}</p>}
                  {savedMessage && !error && (
                    <p className="text-[11px] text-emerald-600">{savedMessage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-40 shrink-0">
              <button
                type="submit"
                className="btn btn-sm rounded-full h-8 min-h-[32px] text-xs gap-1.5 flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                <Icon path={icons.save} size={13} />
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-sm rounded-full h-8 min-h-[32px] text-xs gap-1.5 flex-1 sm:flex-none bg-white border-rose-300 text-rose-500 hover:bg-rose-50"
              >
                <Icon path={icons.reset} size={13} />
                Reset to Default
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-sm rounded-full h-8 min-h-[32px] text-xs gap-1.5 flex-1 sm:flex-none bg-white border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <Icon path={icons.cancel} size={13} />
                Cancel
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[8.5px] text-violet-800/60">©2026 Inventory Management System</p>
          <p className="text-[8.5px] text-violet-800/60">All rights reserved</p>
        </div>
      </div>
    </div>
  );
}