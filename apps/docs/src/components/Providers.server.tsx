import { T3M4Provider } from "@/lib/T3M4";
import { FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {}
export const Providers: FC<Props> = ({ children }) => {
  return (
    <T3M4Provider>
      {children}
    </T3M4Provider>
  )
}