import React from 'react';

export default function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content p-10">
      <nav>
        <h6 className="footer-title">Services</h6>
        <a className="link link-hover" href="#">Branding</a>
        <a className="link link-hover" href="#">Design</a>
        <a className="link link-hover" href="#">Marketing</a>
        <a className="link link-hover" href="#">Advertisement</a>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <a className="link link-hover" href="#">About us</a>
        <a className="link link-hover" href="#">Contact</a>
        <a className="link link-hover" href="#">Jobs</a>
        <a className="link link-hover" href="#">Press kit</a>
      </nav>
      <nav>
        <h6 className="footer-title">Legal</h6>
        <a className="link link-hover" href="#">Terms of use</a>
        <a className="link link-hover" href="#">Privacy policy</a>
        <a className="link link-hover" href="#">Cookie policy</a>
      </nav>
    </footer>
  );
}
