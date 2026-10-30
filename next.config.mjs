/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 你自己的 Supabase 项目（以后把图片传到 Storage 就靠这个）
      {
        protocol: "https",
        hostname: "xeiamoluvslxyzhtnhns.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // 临时用：免费图库，给测试数据配图（换成自己上传的图后可以删掉）
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
