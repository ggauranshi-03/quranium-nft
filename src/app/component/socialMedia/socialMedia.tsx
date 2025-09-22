
import Image from "next/image";
import Link from "next/link";
import React from "react";

const SocialMedia = ({socialMedia ,socialMediaClassStyle}) => {
  return (
    <div className={`social-media-wrapper flex ${socialMediaClassStyle}`}>
      {socialMedia?.map((ele) => (
        <Link href={ele?.link} target="_blank" key={ele?.name} className="mr-2  ">
          <Image src={ele?.logo} alt={ele?.name}  />
        </Link>
      ))}
    </div>
  );
};

export default SocialMedia;
