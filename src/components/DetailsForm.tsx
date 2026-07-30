"use client";

import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import React from "react";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Andaman & Nicobar Islands",
  "Puducherry",
];

interface AddressForm {
  type: string;
  flatHouse: string;
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface SavedAddress {
  id: string;
  type: string;
  flatHouse: string;
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface DetailsFormProps {
  isStepPayment: boolean;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  fieldErrors: Record<string, string>;
  error: string | null;
  isLoading: boolean;
  showAddressForm: boolean;
  addressForm: AddressForm;
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onShowAddressForm: (v: boolean) => void;
  onAddressFormChange: (form: AddressForm) => void;
  onSaveAddress: () => void;
  onSelectAddress: (addr: SavedAddress) => void;
  onContinue: () => void;
}

const DetailsForm = React.memo(function DetailsForm({
  isStepPayment,
  customerFirstName,
  customerLastName,
  customerEmail,
  fieldErrors,
  error,
  isLoading,
  showAddressForm,
  addressForm,
  savedAddresses,
  selectedAddress,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onShowAddressForm,
  onAddressFormChange,
  onSaveAddress,
  onSelectAddress,
  onContinue,
}: DetailsFormProps) {
  return (
    <section className="checkout__section">
      <div className="checkout__step-header">
        <CheckCircle2 size={24} />
        <h2>YOUR DETAILS</h2>
        <span className="checkout__verified-badge">✓ Verified</span>
      </div>
      <p className="checkout__step-desc">
        We&apos;ll use this to contact you about your order
      </p>

      <div className="checkout__row">
        <div className="checkout__field">
          <label>First Name *</label>
          <input
            type="text"
            value={customerFirstName}
            onChange={(e) => {
              onFirstNameChange(e.target.value.replace(/[^a-zA-Z\s]/g, ""));
            }}
            className={fieldErrors.firstName ? "error" : ""}
          />
          {fieldErrors.firstName && (
            <span className="checkout__error">{fieldErrors.firstName}</span>
          )}
        </div>
        <div className="checkout__field">
          <label>Last Name *</label>
          <input
            type="text"
            value={customerLastName}
            onChange={(e) => {
              onLastNameChange(e.target.value.replace(/[^a-zA-Z\s]/g, ""));
            }}
            className={fieldErrors.lastName ? "error" : ""}
          />
          {fieldErrors.lastName && (
            <span className="checkout__error">{fieldErrors.lastName}</span>
          )}
        </div>
      </div>

      <div className="checkout__field">
        <label>Email *</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => {
            onEmailChange(e.target.value);
          }}
          className={fieldErrors.email ? "error" : ""}
        />
        {fieldErrors.email && (
          <span className="checkout__error">{fieldErrors.email}</span>
        )}
      </div>

      <div className="checkout__address-section">
        <h3 className="checkout__address-title">DELIVERY ADDRESS</h3>

        {!showAddressForm && (
          <button
            className="checkout__add-address-btn"
            onClick={() => onShowAddressForm(true)}
          >
            + Add New Address
          </button>
        )}

        {showAddressForm && (
          <div className="checkout__address-form">
            <div className="checkout__address-type-btns">
              {["HOME", "WORK", "OTHER"].map((type) => (
                <button
                  key={type}
                  onClick={() => onAddressFormChange({ ...addressForm, type })}
                  className={`checkout__address-type-btn ${addressForm.type === type ? "active" : ""}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="checkout__field">
              <label>House/Flat/Building *</label>
              <input
                type="text"
                value={addressForm.flatHouse}
                onChange={(e) =>
                  onAddressFormChange({
                    ...addressForm,
                    flatHouse: e.target.value,
                  })
                }
              />
            </div>

            <div className="checkout__field">
              <label>Street/Area/Landmark *</label>
              <input
                type="text"
                value={addressForm.areaStreet}
                onChange={(e) =>
                  onAddressFormChange({
                    ...addressForm,
                    areaStreet: e.target.value,
                  })
                }
              />
            </div>

            <div className="checkout__row checkout__row--3">
              <div className="checkout__field">
                <label>City *</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) =>
                    onAddressFormChange({
                      ...addressForm,
                      city: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                    })
                  }
                />
              </div>
              <div className="checkout__field">
                <label>State *</label>
                <select
                  value={addressForm.state}
                  onChange={(e) =>
                    onAddressFormChange({
                      ...addressForm,
                      state: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="checkout__field">
                <label>PIN Code *</label>
                <input
                  type="text"
                  value={addressForm.pincode}
                  onChange={async (e) => {
                    const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
                    onAddressFormChange({
                      ...addressForm,
                      pincode: pin,
                    });
                    if (pin.length === 6) {
                      try {
                        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                        const data = await res.json();
                        if (data && data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
                          const po = data[0].PostOffice[0];
                          onAddressFormChange({
                            ...addressForm,
                            pincode: pin,
                            city: po.District || "",
                            state: po.State || "",
                          });
                        }
                      } catch (err) {
                        console.error("Failed to auto-populate address from pincode:", err);
                      }
                    }
                  }}
                  maxLength={6}
                />
              </div>
            </div>

            <div className="checkout__address-form-actions">
              <button
                className="checkout__btn-secondary"
                onClick={() => onShowAddressForm(false)}
              >
                Cancel
              </button>
              <button
                className="checkout__btn-primary"
                onClick={onSaveAddress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Save Address"
                )}
              </button>
            </div>
          </div>
        )}

        {savedAddresses.length > 0 && (
          <div className="checkout__saved-addresses">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`checkout__address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
                onClick={() => {
                  onSelectAddress(addr);
                  onShowAddressForm(false);
                }}
              >
                <div className="checkout__address-card-header">
                  <span className="checkout__address-type">{addr.type}</span>
                  {addr.isDefault && (
                    <span className="checkout__address-default">Default</span>
                  )}
                  {selectedAddress?.id === addr.id && (
                    <CheckCircle2
                      size={14}
                      className="checkout__address-check"
                    />
                  )}
                </div>
                <p className="checkout__address-detail">{addr.flatHouse}</p>
                <p className="checkout__address-detail">
                  {addr.areaStreet}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <span className="checkout__error">{error}</span>}

      <div className="checkout__mobile-sticky-bottom">
        <button
          className="checkout__continue-btn"
          onClick={onContinue}
          disabled={isLoading || !selectedAddress}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : isStepPayment ? (
            "CONFIRM DETAILS"
          ) : (
            "CONTINUE TO PAYMENT"
          )}{" "}
          <ChevronRight size={18} />
        </button>

        <div className="checkout__powered-by-wrapper">
          <div className="checkout__powered-by">
            <span>Powered by</span>
            <img
              src="/evoc-logo.png"
              alt="EvocLabs"
              className="checkout__evoc-logo"
            />
          </div>
        </div>
      </div>
    </section>
  );
})

export default DetailsForm;
