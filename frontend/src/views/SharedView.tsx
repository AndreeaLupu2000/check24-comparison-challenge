import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedOffer } from "../api/shareService";
import { OfferDto } from "../types/OfferDto";
import { AddressDto } from "../types/AddressDto";
import OfferCard from "../components/OfferCard";

const SharedView = () => {
  const { id } = useParams<{ id: string }>();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [address, setAddress] = useState<AddressDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getSharedOffer(id)
      .then((share) => {
        // Ensure offers is an array
        const offersArray = Array.isArray(share.offers) ? share.offers : [];
        setOffers(offersArray);
        setAddress(share.address);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load shared offers.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-4">Shared Offers</h1>
      {address && (
        <p className="text-center text-gray-600 mb-6">
          Offers for: {address.street} {address.houseNumber}, {address.plz} {address.city}
        </p>
      )}
      {offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <OfferCard key={index} offer={offer} onView={() => {}} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No offers available for this share link.</p>
      )}
    </div>
  );
};

export default SharedView;
