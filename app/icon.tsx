import { ImageResponse } from "next/og";
export const size = {
  width: 64,
  height: 64
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          border: "4px solid #19E6D4",
          color: "#19E6D4",
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: 2
        }}
      >
        DG
      </div>
    ),
    {
      ...size
    }
  );
}
