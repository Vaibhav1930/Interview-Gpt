import { nav } from 'motion/react-client';
import React from 'react';
import { FlickeringGrid } from "./flickering-grid";
import { SignInButton } from '@clerk/clerk-react';
import { Link } from "react-router-dom";
import Logo from "./logo.webp";
import { Button } from "./button";
import { BoxReveal } from "./box-reveal";

function Landingpage() {
  return (
    <>
      <div className="relative h-screen w-screen overflow-hidden rounded-lg border bg-gray-200/50">
        <div className="absolute w-full h-full">
          <div className="flex justify-between items-center pt-5 px-6 sm:px-10 md:px-16 w-full">
            <Link to="/"><h1 className="text-3xl sm:text-4xl">Interview GPT</h1></Link>
            <SignInButton className="border py-2 px-3 bg-black text-white rounded-3xl cursor-pointer" />
          </div>

          <div className="flex flex-col-reverse lg:flex-row w-full h-full mt-6 lg:mt-0">
            <div className="w-full lg:w-2/5 h-[90%] flex justify-center items-center relative">
              <img src="/assets/logo-n_7j5y68.webp"
  srcSet="
    /assets/logo-n_7j5y68-208.webp 208w,
    /assets/logo-n_7j5y68-288.webp 288w,
    /assets/logo-n_7j5y68-320.webp 320w,
    /assets/logo-n_7j5y68-384.webp 384w
  "
  sizes="(max-width: 640px) 208px,
         (max-width: 768px) 288px,
         (max-width: 1024px) 320px,
         384px"
  class="w-52 sm:w-72 md:w-80 lg:w-96 mt-10 rounded-full"
  alt="Logo" />
            </div>

            <div className="w-full lg:w-1/2 h-[90%] flex items-center justify-center px-6">
              <div className="max-w-lg border-l-4 border-black pl-4">
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="h-11 text-3xl sm:text-4xl md:text-[3.5rem] font-semibold">
                    Interview GPT<span className="text-[#5046e6]">.</span>
                  </p>
                </BoxReveal>

                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="mt-2 text-sm sm:text-base">
                    Answer checker by{" "}
                    <span className="text-[#5046e6]">Software Engineers</span>
                  </h2>
                </BoxReveal>

                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <div className="mt-4 text-sm sm:text-base">
                    <p>
                      -&gt; Choose the topic related to your Interview such as {" "}
                      <span className="font-semibold text-[#5046e6]">React</span>,
                      <span className="font-semibold text-[#5046e6]"> Typescript</span>,
                      <span className="font-semibold text-[#5046e6]"> Tailwind CSS</span>,
                      and
                      <span className="font-semibold text-[#5046e6]"> Motion</span>.
                      <br />
                      -&gt; Reliable and Free of cost <br />
                    </p>
                  </div>
                </BoxReveal>

                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <SignInButton className="mt-4 w-24 h-10 bg-[#5046e6] text-white rounded-2xl" />
                </BoxReveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Landingpage;
