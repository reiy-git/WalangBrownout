
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PhotoCropModal from "./PhotoCropModal";


function buildProfileFromUsername(username) {
  const clean = (username || "").trim();

  const displayName = clean
    ? clean
        .split(/[._\s-]+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ")
    : "Marriyell Burgos";

  return {
    fullName: displayName,
    username: clean || "marriyell.burgos",
    email: clean ? `${clean.replace(/\s+/g, "").toLowerCase()}@gmail.com` : "marriyellburgos87@gmail.com",
    position: "Inventory Staff",
    employeeId: "INS-240-66-12",
    status: "Active",
  };
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Small inline icons, matching the stroke style used in StaffLogin.jsx
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
  id: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="#9a8cc2" strokeWidth="1.5" fill="none" />
      <circle cx="8.5" cy="11" r="1.6" stroke="#9a8cc2" strokeWidth="1.3" fill="none" />
      <path d="M6 15.2c.5-1.2 1.5-1.8 2.5-1.8s2 .6 2.5 1.8" stroke="#9a8cc2" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M14 9.5h4M14 12.5h4M14 15.5h2.5" stroke="#9a8cc2" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5a2 2 0 012-2h1l1-1.5h4l1 1.5h1a2 2 0 012 2V17a2 2 0 01-2 2H6a2 2 0 01-2-2V8.5z" stroke="#7c6bc4" strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="12.5" r="3" stroke="#7c6bc4" strokeWidth="1.4" fill="none" />
    </>
  ),
  refresh: (
    <path d="M4 12a8 8 0 0113.66-5.66M20 12a8 8 0 01-13.66 5.66M4 6v4h4M20 18v-4h-4" stroke="#7c6bc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

export default function StaffViewProfile({ username, avatarUrl = "", onAvatarChange }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => buildProfileFromUsername(username));
  const [draft, setDraft] = useState(() => buildProfileFromUsername(username));
  const [isEditing, setIsEditing] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [cropSrc, setCropSrc] = useState(""); // raw, uncropped selected image, while modal is open
  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const handleBack = () => navigate(-1);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5MB.");
      return;
    }

    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result); // open the crop modal with the raw image
    reader.readAsDataURL(file);
  };

  const handleCropCancel = () => setCropSrc("");

  const handleCropSave = (croppedDataUrl) => {
    if (onAvatarChange) onAvatarChange(croppedDataUrl);
    setCropSrc("");
  };

  const handleRemovePhoto = () => {
    setPhotoError("");
    if (onAvatarChange) onAvatarChange("");
  };

  const handleEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile(draft);
    setIsEditing(false);
  };

  const handleRegenerateId = () => {
    const rand = Math.floor(Math.random() * 900 + 100);
    setDraft((d) => ({ ...d, employeeId: `INS-${240 + rand}-${rand}` }));
  };

  const hasPhoto = Boolean(avatarUrl);
  const photoLabel = hasPhoto ? "Change Photo" : "Add Photo";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 hover:text-violet-900 mb-3"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <h1 className="text-base font-medium text-violet-950">Staff Profile</h1>
        <p className="text-[11px] text-violet-800/70 mb-4">
          View and manage your account details
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Summary card */}
          <div className="card card-sm w-full md:w-56 shrink-0 bg-violet-50/90 shadow-md rounded-xl">
            <div className="card-body items-center text-center p-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  aria-label={photoLabel}
                  className="group relative block w-16 h-16 rounded-full overflow-hidden ring-2 ring-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-violet-400 text-white flex items-center justify-center text-sm font-semibold">
                      {initials(profile.fullName)}
                    </div>
                  )}
                  {/* Hover/focus overlay */}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 group-focus-visible:bg-black/40 transition-colors">
                    <Icon path={icons.camera} size={16} />
                  </span>
                </button>
                {/* Small badge, purely decorative — click target is the whole circle */}
                <span className="btn btn-circle btn-xs absolute -bottom-1 -right-1 bg-white shadow pointer-events-none">
                  <Icon path={icons.camera} size={12} />
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="text-[10px] font-medium text-violet-600 hover:text-violet-800"
                >
                  {photoLabel}
                </button>
                {hasPhoto && (
                  <>
                    <span className="text-[10px] text-violet-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-[10px] font-medium text-violet-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              {photoError && (
                <p className="text-error text-[10px] mt-1">{photoError}</p>
              )}

              <h2 className="mt-2 text-sm font-medium text-violet-950">{profile.fullName}</h2>
              <span className="badge badge-xs bg-emerald-500 text-white border-0 mt-1 text-[9px]">
                {profile.status}
              </span>

              <div className="w-full mt-3 pt-3 border-t border-violet-200/70 text-left space-y-2">
                <div>
                  <div className="text-[9px] tracking-widest text-violet-800/60">EMPLOYEE ID</div>
                  <div className="text-[11px] font-medium text-violet-900">{profile.employeeId}</div>
                </div>
                <div>
                  <div className="text-[9px] tracking-widest text-violet-800/60">JOB POSITION</div>
                  <div className="text-[11px] font-medium text-violet-900">{profile.position}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal information card */}
          <div className="card card-sm flex-1 bg-violet-50/90 shadow-md rounded-xl">
            <div className="card-body p-4 sm:p-5">
              <p className="text-[11px] font-medium text-violet-900 text-center mb-3">
                Personal Information
              </p>

              <form className="flex flex-col gap-2.5 text-left" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Field label="Full Name" icon={icons.user}>
                    <input
                      type="text"
                      className="grow min-w-0 text-xs"
                      value={draft.fullName}
                      onChange={handleChange("fullName")}
                      disabled={!isEditing}
                    />
                  </Field>

                  <div>
                    <label className="text-[11px] font-medium text-violet-900/80 mb-0.5 block">
                      Position
                    </label>
                    <select
                      className="select select-sm w-full h-8 text-xs"
                      value={draft.position}
                      onChange={handleChange("position")}
                      disabled={!isEditing}
                    >
                      <option>Inventory Staff</option>
                      <option>Warehouse Staff</option>
                      <option>Logistics Staff</option>
                    </select>
                  </div>

                  <Field label="Username" icon={icons.user}>
                    <input
                      type="text"
                      className="grow min-w-0 text-xs"
                      value={draft.username}
                      onChange={handleChange("username")}
                      disabled={!isEditing}
                    />
                  </Field>

                  <div>
                    <label className="text-[11px] font-medium text-violet-900/80 mb-0.5 block">
                      Employee ID
                    </label>
                    <div className="input input-sm w-full flex items-center gap-2 h-8 px-2.5">
                      <Icon path={icons.id} />
                      <input type="text" className="grow min-w-0 text-xs" value={draft.employeeId} disabled />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleRegenerateId}
                          aria-label="Regenerate employee ID"
                          className="shrink-0"
                        >
                          <Icon path={icons.refresh} size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Email Address" icon={icons.mail}>
                      <input
                        type="email"
                        className="grow min-w-0 text-xs"
                        value={draft.email}
                        onChange={handleChange("email")}
                        disabled={!isEditing}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-sm rounded-full h-8 min-h-[32px] text-xs px-4"
                  >
                    Back
                  </button>

                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="btn btn-primary btn-sm rounded-full h-8 min-h-[32px] text-xs px-4"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-sm rounded-full h-8 min-h-[32px] text-xs px-4"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm rounded-full h-8 min-h-[32px] text-xs px-4"
                      >
                        Save Changes
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[8.5px] text-violet-800/60">©2026 Inventory Management System</p>
          <p className="text-[8.5px] text-violet-800/60">All rights reserved</p>
        </div>
      </div>

      {cropSrc && (
        <PhotoCropModal src={cropSrc} onCancel={handleCropCancel} onSave={handleCropSave} />
      )}
    </div>
  );
}