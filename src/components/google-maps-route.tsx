import React from "react";

interface GoogleMapsRouteProps {
  origin: string;
  destination: string;
  className?: string;
}

const GoogleMapsRoute: React.FC<GoogleMapsRouteProps> = ({
  origin,
  destination,
  className,
}) => {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    origin
  )}+to+${encodeURIComponent(destination)}&output=embed`;

  return (
    <iframe
      className={className || "w-full h-64 border-0 rounded-md"}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={mapSrc}
    ></iframe>
  );
};

export default GoogleMapsRoute;
