import { nav } from 'motion/react-client'
import React from 'react'
import { FlickeringGrid } from "./flickering-grid";
import { SignInButton } from '@clerk/clerk-react';
import {Link} from "react-router-dom"
import Logo from "./logo.webp"
import { Button } from "./button";
import { BoxReveal } from "./box-reveal";

function Landingpage() {
  return (
    <>
    <div className="relative h-screen w-screen overflow-hidden rounded-lg border bg-gray-200/50">
      
      <div className='absolute w-screen h-screen'>
      <div className="flex justify-between place-items-center pt-5 px-16  w-full">
      <Link to="/" ><h1 className='text-4xl'>Interview</h1></Link>
      <SignInButton className="border py-2 px-3 bg-black text-white rounded-3xl cursor-pointer"></SignInButton>
      </div>
      <div className="flex w-full h-full">
        <div className="w-2/5 h-[90%] content-center justify-center relative ">
        <img src={Logo} className='bg-black w-96 mt-10 rounded-full absolute right-0 top-24 ' alt="" /></div>    
        <div className="w-1/2 h-[90%] content-center place-items-center">
        <div className=" max-w-lg border-l-4 border-black pl-4 items-center justify-center overflow-hidden">
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <p className="text-[3.5rem] font-semibold">
          Interview GPT<span className="text-[#5046e6]">.</span>
        </p>
      </BoxReveal>
 
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <h2 className="mt-[.5rem] text-[1rem]">
          Answer checker by{" "}
          <span className="text-[#5046e6]">Software Engineers</span>
        </h2>
      </BoxReveal>
 
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <div className="mt-6">
          <p>
            -&gt; Choose the topic related to your Interview such as {" "}
            <span className="font-semibold text-[#5046e6]">React</span>,
            <span className="font-semibold text-[#5046e6]">Typescript</span>,
            <span className="font-semibold text-[#5046e6]">Tailwind CSS</span>,
            and
            <span className="font-semibold text-[#5046e6]">Motion</span>
            . <br />
            -&gt; Realiable and Free of cost <br />
          </p>
        </div>
      </BoxReveal>
 
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <SignInButton className="mt-2 w-20 h-10 bg-[#5046e6] px-3 py-1 text-white rounded-2xl"> Sign In</SignInButton>
      </BoxReveal>
    </div>
        </div>
      </div>
    </div>
    </div>
    </>
  )
}

export default Landingpage
