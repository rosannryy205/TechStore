import Hero3D from "@/components/client/home/Hero3D";

/**
 * Banner proxy to ensure complete backward compatibility
 * while delivering full 3D interactive hero experience.
 */
export default function Banner(props) {
  return <Hero3D {...props} />;
}
