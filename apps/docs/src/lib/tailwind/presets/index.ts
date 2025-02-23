import type { Config } from "tailwindcss";
import { shadcnUIPlugin } from "../plugins/shadcn-ui";
import { typographyPlugin } from "../plugins/typography";

export const preset = {
  content: [],
  plugins: [shadcnUIPlugin, typographyPlugin]
} satisfies Config