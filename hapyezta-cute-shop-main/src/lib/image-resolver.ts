import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import p9 from "@/assets/p9.jpg";
import p10 from "@/assets/p10.jpg";
import p11 from "@/assets/p11.jpg";
import p12 from "@/assets/p12.jpg";

import c1 from "@/assets/c1.jpg";
import c2 from "@/assets/c2.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";
import c5 from "@/assets/c5.jpg";
import c6 from "@/assets/c6.jpg";
import c7 from "@/assets/c7.jpg";
import c8 from "@/assets/c8.jpg";

import hero from "@/assets/hero.jpg";
import hero_slide_1 from "@/assets/hero_slide_1.png";
import hero_slide_2 from "@/assets/hero_slide_2.png";
import hero_slide_3 from "@/assets/hero_slide_3.png";

const imageMap: Record<string, string> = {
  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12,
  c1, c2, c3, c4, c5, c6, c7, c8,
  hero, hero_slide_1, hero_slide_2, hero_slide_3
};

export function resolveImage(img: string): string {
  if (!img) return "";
  // Check if it's a key in our mapped local assets
  if (img in imageMap) {
    return imageMap[img];
  }
  // Otherwise, return the string directly (could be base64 or external url)
  return img;
}
