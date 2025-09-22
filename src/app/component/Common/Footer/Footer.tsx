import Image from "next/image";
import React from "react";
import { whiteLogo } from "../../../../../public/assests/footer";
import Link from "next/link";
import {
  FaXTwitter,
  FaLinkedin,
  FaRedditAlien,
  FaTelegram,
  FaInstagram,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] py-12 px-4 sm:px-8 text-[#f9f9f9] border-t border-[#C9C9C980] mt-8 w-full z-10 min-h-[320px] sm:min-h-[260px] pb-32 sm:pb-16">
      <div className="w-full">
        <div className="max-w-screen-xl mx-auto w-full">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-6">
            {/* Logo & Tagline */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Image
                src={whiteLogo}
                alt="Quranium Logo"
                width={150}
                height={40}
              />
              <p className="text-sm mt-2 mb-8 font-montserrat">
                The Uncrackable foundation of Digital Era.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm font-montserrat font-semibold">
              <Link target="_blank" href="https://faucet.quranium.org/">
                Faucet
              </Link>
              <Link target="_blank" href="https://www.qsafewallet.com/">
                QSafe Wallet
              </Link>
              <Link target="_blank" href="https://quranium.org/">
                Quranium Website
              </Link>
              <Link target="_blank" href="https://discord.gg/XcE6XyxaSy">
                Support
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col-reverse lg:flex-row justify-between items-center mt-10 gap-4 pt-4 text-xs">
            <p className="text-[#2C374F] text-center lg:text-left">
              © 2025 — Quranium Global. All Rights Reserved.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 text-xl text-white">
              <a
                href="https://x.com/quranium_org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter />
              </a>
              <a
                href="https://discord.com/invite/quranium"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDiscord />
              </a>
              <a
                href="https://t.me/quraniumcommunity"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTelegram />
              </a>
              <a
                href="https://www.youtube.com/@Quranium/videos/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube />
              </a>
              <a
                href="https://www.linkedin.com/company/quranium/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.instagram.com/quraniumofficial/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.reddit.com/r/Quranium_org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaRedditAlien />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
