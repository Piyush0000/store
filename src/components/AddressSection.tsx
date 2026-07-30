"use client";

import { Phone } from "lucide-react";

import React from "react";

interface SavedAddress {
  id: string;
  type: string;
  flatHouse: string;
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressSectionProps {
  selectedAddress: SavedAddress | null;
  customerFirstName: string;
  customerLastName: string;
  phone: string;
  onChangeClick: () => void;
}

const AddressSection = React.memo(function AddressSection({
  selectedAddress,
  customerFirstName,
  customerLastName,
  phone,
  onChangeClick,
}: AddressSectionProps) {
  if (!selectedAddress) return null;
  const tagLabel = selectedAddress.type || "HOME";

  return (
    <div className="checkout__delivery-capsule">
      <div className="checkout__delivery-capsule-header">
        <span className="checkout__delivery-capsule-title">
          Delivery details
        </span>
        <button
          type="button"
          className="checkout__delivery-capsule-change"
          onClick={onChangeClick}
        >
          Change
        </button>
      </div>
      <div className="checkout__delivery-capsule-content">
        <div className="checkout__delivery-capsule-name-row">
          <span className="checkout__delivery-capsule-name">
            {customerFirstName} {customerLastName}
          </span>
          <span className="checkout__delivery-capsule-tag">
            {tagLabel.charAt(0).toUpperCase() + tagLabel.slice(1).toLowerCase()}
          </span>
        </div>
        <p className="checkout__delivery-capsule-address">
          {selectedAddress.flatHouse}, {selectedAddress.areaStreet},{" "}
          {selectedAddress.city}, {selectedAddress.state}
        </p>
        <p className="checkout__delivery-capsule-pincode">
          {selectedAddress.pincode}
        </p>
        <div className="checkout__delivery-capsule-phone">
          <Phone size={14} className="checkout__delivery-capsule-phone-icon" />
          <span>{phone}</span>
        </div>
      </div>
    </div>
  );
})

export default AddressSection;
