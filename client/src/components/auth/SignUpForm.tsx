import { useState, useEffect } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
import Select from "../form/Select";
import FileInput from "../form/input/FileInput";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  // const [isChecked, setIsChecked] = useState(false);

  const [form, setForm] = useState({
    user_name: "",
    user_pass: "",
    user_email: "",
    user_phone: "",
    user_level: "",
    pasar_code: "",
    user_status: "",
  });

  const [fotopengguna, setFotoPengguna] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [listPasar, setListPasar] = useState([]);
  const [listLevel, setListLevel] = useState([]);
  const [loggedInUserLevel, setLoggedInUserLevel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setLoggedInUserLevel(decodedToken.level || null);
      } catch (error) {
        console.error("Error decoding token:", error);
        setLoggedInUserLevel(null);
        setErrorMessage("Sesi tidak valid, silakan login kembali.");
      }
    } else {
      setLoggedInUserLevel(null);
      setErrorMessage("Tidak dapat memverifikasi pengguna. Silakan login.");
    }
  }, []);

  useEffect(() => {
    if (loggedInUserLevel !== null) {
      const fetchData = async () => {
        try {
          const levelData = await api.get("/level");
          setListLevel(levelData.data || []);

          if (loggedInUserLevel === "SUA") {
            const pasarData = await api.get("/pasar");
            setListPasar(pasarData.data || []);
          } else {
            setListPasar([]);
            setForm((prevForm) => ({ ...prevForm, pasar_code: "" }));
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setErrorMessage("Gagal memuat data level/pasar.");
          setListLevel([]);
          setListPasar([]);
        }
      };
      fetchData();
    }
  }, [loggedInUserLevel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    
    formData.append("user_name", form.user_name);
    formData.append("user_pass", form.user_pass);
    formData.append("user_phone", form.user_phone);
    formData.append("user_email", form.user_email);
    
    if (form.user_level) {
      const selectedLevel = listLevel.find(level => level.level_code === form.user_level);
      if (selectedLevel) {
        formData.append("user_level_name", selectedLevel.level_name);
      }
    }
    
    if (form.pasar_code) {
      formData.append("pasar_code", form.pasar_code);
    }
    
    formData.append("user_status", form.user_status);
    
    if (fotopengguna) {
      formData.append("user_foto", fotopengguna);
    }
  
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
  
    try {
      const response = await api.post("/auth/signup", formData);
      
      console.log("Server response:", response);
      alert("Registrasi berhasil! Silakan login.");
      navigate("/signin");
    } catch (error) {
      console.error("Error details:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Registrasi gagal: " + error.message);
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      {/* <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div> */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill the form to create an account!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  {/* <!-- Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="user_name"
                      name="user_name"
                      type="text"
                      placeholder="Enter your first name"
                      onChange={handleChange}
                      value={form.user_name}
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="user_email"
                    name="user_email"
                    type="email"
                    value={form.user_email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="user_pass"
                      name="user_pass"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={form.user_pass}
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  {/* <!-- Phone --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Phone<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="user_phone"
                      name="user_phone"
                      value={form.user_phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div>
                  {/* <!-- Select role type --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Role type<span className="text-error-500">*</span>
                    </Label>
                    <Select
                      placeholder="Choose role type"
                      options={listLevel.map((level) => ({
                        value: level.level_code,
                        label: level.level_name,
                      }))}
                      defaultValue=""
                      onChange={(value) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          user_level: value,
                        }))
                      }
                    />
                  </div>
                </div>
                {/* Input foto pengguna */}
                <div>
                  <div className="sm:col-span-1">
                    <Label>
                      Foto Pengguna<span className="text-error-500">*</span>
                    </Label>
                    <FileInput
                      onChange={(e) => setFotoPengguna(e.target.files[0])}
                    />
                  </div>
                </div>
                {/* <!-- Select pasar --> */}
                <div>
                  <div className="sm:col-span-1">
                    <Label>
                      Pasar<span className="text-error-500">*</span>
                    </Label>
                    <Select
                      placeholder="Choose pasar"
                      options={listPasar.map((pasar) => ({
                        value: pasar.pasar_code,
                        label: pasar.pasar_nama,
                      }))}
                      defaultValue=""
                      onChange={(value) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          pasar_code: value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <div className="sm:col-span-1">
                    <Label>
                      Status<span className="text-error-500">*</span>
                    </Label>
                    <Select
                      placeholder="Choose status"
                      options={[
                        { value: "A", label: "Aktif" },
                        { value: "N", label: "Tidak Aktif" },
                      ]}
                      defaultValue=""
                      onChange={(value) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          user_status: value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* <!-- Checkbox --> */}
                {/* <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div> */}
                {/* <!-- Button --> */}
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Sign Up
                  </button>
                </div>
              </div>
            </form>

            {/* Error message */}
            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
