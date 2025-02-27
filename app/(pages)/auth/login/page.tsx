"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/UseAuth";
import { Grid, Typography } from "@mui/material";
import Logo from "@/app/components/logo/Logo";
import Google from "@/app/components/logo/Google";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useEffect } from "react";
import Link from "next/link";
import Aos from "aos";
import { IsDesktop } from "@/app/hooks";
import API from "@/app/utils/API";
import { toast, Bounce, ToastContainer } from "react-toastify";

const Login: React.FC = () => {
  const navigation = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const Auth = useAuth();
  const isDesktop = IsDesktop();

  const onLogin = () => {
    setIsLoading(true);
    API.post("/admin/auth/login", {
      email: email,
      password: password,
    })
      .then((res) => {
        setIsLoading(false);
        const data: any = {
          user: {
            id: res.data.data._id,
            fullName: res.data.data.fullName,
            phone: res.data.data.phone,
            email: res.data.data.email,
          },
          token: `Bearer ${res.data.data.token}`,
        };
        // console.log(data);
        Auth.login(data);
        toast.success(`${res.data.message}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(`${err.response.data.message}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        console.log("error", err);
      });
  };

  useEffect(() => {
    // Aos.init();
    // Aos.refresh();
    if (Auth.auth.isAuthenticated) {
      navigation.replace("/");
    }
  }, [Auth.auth.isAuthenticated, navigation]);

  if (Auth.auth.isAuthenticated) {
    navigation.replace("/");
    return null;
  }

  return isDesktop ? (
    <div className="w-screen h-screen flex items-center justify-between overflow-hidden">
      <div className="h-full w-[50%] flex flex-col justify-center items-center gap-5 border-r-[1px] border-gray-400 shadow-[3px_0px_15px_gray]">
        <Logo size={250} />
        <div className=" flex flex-col items-center gap-3">
          <h1 className=" text-[#202226] font-semibold text-5xl">
            Selamat Datang
          </h1>
          <h6 className=" text-center text-[#838383] text-xl">
            Selamat datang pemilik kredit air. Silahkan masukkan detail Anda
            untuk melanjutkan.
          </h6>
        </div>
      </div>
      <div className="h-full w-[50%] flex flex-col justify-center items-center px-56">
        <div className=" w-full flex flex-col gap-8 items-center">
          <div className="flex flex-col gap-2 items-center">
            <h1
              data-aos={"fade-up"}
              data-aos-duration={"1000"}
              className=" text-[#202226] font-semibold text-2xl"
            >
              Silahkan masukkan detail Anda
            </h1>
            <h6 className=" text-center text-[#838383] text-sm">
              Silahkan masukkan detail Anda untuk melanjutkan.
            </h6>
          </div>
          <div className=" w-full flex flex-col gap-5 items-center">
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  color: "black", // Warna teks input
                  "& fieldset": {
                    borderColor: "#EDEDED", // Warna outline default
                  },
                  "&:hover fieldset": {
                    borderColor: "#EDEDED", // Warna outline saat hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#EDEDED", // Warna outline saat fokus
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "black", // Warna label default
                  "&.Mui-focused": {
                    color: "black", // Warna label saat fokus
                  },
                },
              }}
            />
            <TextField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"} // Toggle tipe input
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  color: "black", // Warna teks input
                  "& fieldset": {
                    borderColor: "#EDEDED", // Warna outline default
                  },
                  "&:hover fieldset": {
                    borderColor: "#EDEDED", // Warna outline saat hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#EDEDED", // Warna outline saat fokus
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "black", // Warna label default
                  "&.Mui-focused": {
                    color: "black", // Warna label saat fokus
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      style={{ color: "gray" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* <button
          onClick={() => onLogin()}
          className="w-full bg-[#039FE1] text-center text-white font-semibold text-base rounded-xl py-3"
        >
          Sign in
        </button> */}
            <LoadingButton
              loading={isLoading}
              variant="outlined"
              onClick={() => onLogin()}
              sx={{
                backgroundColor: "#039FE1",
                width: "100%",
                height: "48px",
                color: "#ffffff",
                borderColor: "#039FE1",
                "&:hover": {
                  backgroundColor: "#039FE1", // Warna saat hover
                  borderColor: "#039FE1",
                },
                "& .MuiLoadingButton-loadingIndicator": {
                  color: "#ffffff", // Warna indikator loading
                },
              }}
            >
              {!isLoading ? (
                <h1 className="text-white font-semibold text-base">Sign in</h1>
              ) : null}
            </LoadingButton>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  ) : null;
};

export default Login;
