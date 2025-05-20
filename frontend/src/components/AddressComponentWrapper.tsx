import { useJsApiLoader } from "@react-google-maps/api";
import AddressComponent from "./AddressComponent";

/**
 * AddressComponentWrapper component
 * @param props - The props for the AddressComponent
 * @returns The AddressComponent
 */
const AddressComponentWrapper = (props: any) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_API!,
    libraries: ['places'],
  });

  if (!isLoaded) return null; // You can show a spinner here

  return <AddressComponent {...props} />;
};

export default AddressComponentWrapper;
