"use client"

import { useRouter } from "next/navigation";

export default function Home() {
  
  const router = useRouter();

  function handleClick() {
    router.push('/dashboard')
  }

  return (
    <>
      <button onClick={handleClick}>Login</button>
    </>
  );
}
