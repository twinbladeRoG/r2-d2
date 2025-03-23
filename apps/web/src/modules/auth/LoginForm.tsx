import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useLogin } from "../../apis/queries/auth.queries";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  username: yup.string().required(),
  password: yup.string().required()
});

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    login.mutate(data, {
      onSuccess: (res) => {
        localStorage.setItem("ACCESS_TOKEN", res.access_token);
        localStorage.setItem("REFRESH_TOKEN", res.refresh_token);

        navigate("/");
      },
      onError: (error) => {
        notifications.show({
          title: "Oops! Something went wrong",
          message: error.message,
          color: "red"
        });
      }
    });
  });

  return (
    <form className={className} onSubmit={handleSubmit}>
      <h1 className="font-bold text-2xl mb-3 text-center">Login</h1>

      <TextInput
        {...form.register("username")}
        error={form.formState.errors.username?.message}
        type="email"
        label="Email"
        placeholder="Email"
        mb="lg"
      />
      <PasswordInput
        {...form.register("password")}
        error={form.formState.errors.password?.message}
        label="Password"
        placeholder="Password"
        mb="lg"
      />

      <Button fullWidth type="submit" loading={login.isPending}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
