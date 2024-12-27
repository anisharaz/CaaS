"use client";
import { Button } from "@/components/ui/button";
import "./welcome.css";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { initializeUser } from "../actions/infra";
import { useRouter } from "next/navigation";

function UsernameInput() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  async function HandleSubmit() {
    setLoading(true);
    const res = await initializeUser({
      username: username,
    });
    if (!res.success) {
      alert(res.message);
      setLoading(false);
      return;
    }
    router.push("/console");
  }
  return (
    <>
      <div className="input__container m-12">
        <div className="shadow__input"></div>
        <button className="input__button__shadow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#000000"
            width="20px"
            height="20px"
          >
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
        </button>
        <input
          type="text"
          name="username"
          className="input__search"
          placeholder="Enter username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
      </div>
      {loading ? (
        <Button disabled size={"lg"} className="w-1/2 text-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div>Hold on</div>
        </Button>
      ) : (
        <Button
          disabled={username.length < 3}
          size={"lg"}
          className="w-1/2 text-lg"
          onClick={HandleSubmit}
        >
          Next
        </Button>
      )}
    </>
  );
}

export default UsernameInput;
