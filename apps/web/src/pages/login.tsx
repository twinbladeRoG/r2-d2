import LoginForm from "../modules/auth/LoginForm";

const Login = () => {
  return (
    <main className="bg-linear-to-bl from-violet-500 to-fuchsia-500 min-h-dvh p-8 flex flex-col justify-center">
      <LoginForm className="max-w-3xl w-full mx-auto bg-gray-900 p-8 shadow-2xl rounded-xl" />
    </main>
  );
};

export default Login;
