import { useJsApiLoader } from "@react-google-maps/api";
import AddressComponent from "./AddressComponent";

const AddressComponentWrapper = (props) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACE_API!,
    libraries: ['places'],
  });

  if (!isLoaded) return null; // You can show a spinner here

  return <AddressComponent {...props} />;
};

export default AddressComponentWrapper;
