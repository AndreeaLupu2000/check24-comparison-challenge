//components/AddressComponentWrapper.tsx
// React
import { useJsApiLoader } from "@react-google-maps/api";
// Components
import AddressComponent from "./AddressComponent";

interface AddressComponentProps {
  errors?: {
    plz?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  };
  onFieldChange?: (field: "plz" | "city" | "street" | "houseNumber") => void;
}

/**
 * AddressComponentWrapper component
 * @param props - The props for the AddressComponent
 * @returns The AddressComponent
 */
const AddressComponentWrapper = (props: AddressComponentProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_API!,
    libraries: ['places'],
  });

  if (!isLoaded) return null; // You can show a spinner here

  return <AddressComponent {...props} />;
};

export default AddressComponentWrapper;
