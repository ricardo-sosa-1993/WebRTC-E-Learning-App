import React from "react";

const icons: Record<string, any> = {
  eraser: <svg id="Capa_1" enable-background="new 0 0 512.121 512.121" height="2rem" viewBox="0 0 512.121 512.121" width="2rem" xmlns="http://www.w3.org/2000/svg"><g><path d="m317.025 33.131-317.025 317.025 128.835 128.834h132.521l250.765-250.764zm152.67 195.095-84.233 84.233-152.669-152.669 84.232-84.232zm-105.446 105.446-21.247 21.247-152.67-152.669 21.248-21.248zm-115.318 115.318h-107.67l-98.835-98.834 126.693-126.693 152.67 152.669z"/></g></svg>
};

type IconProps = {
  iconName: string;
}

function Icon({ iconName }: IconProps) {
  return icons[iconName];
}

export default Icon;