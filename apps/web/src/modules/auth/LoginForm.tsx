import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, PasswordInput, TextInput } from "@mantine/core";

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

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log(data);
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

      <Button fullWidth type="submit">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
