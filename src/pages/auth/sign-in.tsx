import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";

import axios from "axios";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const loginFormSchema = z.object({
  login: z.string().email(),
  password: z.string(),
});

const mfaFormSchema = z.object({
  code: z.string().min(6),
});

export default function SignIn() {
  const [mfaTicket, setMfaTicket] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const loginForm = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { login: "", password: "" },
  });

  const mfaForm = useForm({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: { code: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (values: z.infer<typeof loginFormSchema>) =>
      axios
        .post("https://discord.com/api/v9/auth/login", values)
        .then((res) => res.data),
    onSuccess: (data) => {
      if (data.mfa || data.sms || data.totp) {
        setMfaTicket(data.ticket);
      } else {
        localStorage.setItem("token", data.token);
        navigate("/");
      }
    },
  });

  const mfaMutation = useMutation({
    mutationFn: (values: { code: string; ticket: string }) =>
      axios
        .post("https://discord.com/api/v9/auth/mfa/totp", values)
        .then((res) => res.data),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate("/");
    },
  });

  function handleLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    loginMutation.mutate(values);
  }

  function handleMfaSubmit(values: z.infer<typeof mfaFormSchema>) {
    mfaMutation.mutate({ ...values, ticket: mfaTicket });
  }

  function renderLoginForm() {
    return (
      <div className="flex flex-col w-full">
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
            className="space-y-1.5"
          >
            <FormField
              control={loginForm.control}
              name="login"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className={cn(
                "w-full transition",
                loginMutation.isPending && "opacity-90 hover:opacity-90"
              )}
              type="submit"
            >
              {loginMutation.isPending ? (
                <p>Signing you in...</p>
              ) : (
                <p>Sign In</p>
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  function renderMfaForm() {
    return (
      <Form {...mfaForm}>
        <form
          onSubmit={mfaForm.handleSubmit(handleMfaSubmit)}
          className="space-y-1.5"
        >
          <FormField
            control={mfaForm.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>2FA Code</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className={cn(
              "w-full transition",
              loginMutation.isPending && "opacity-90 hover:opacity-90"
            )}
            type="submit"
          >
            {loginMutation.isPending ? (
              <p>Signing you in...</p>
            ) : (
              <p>Sign In</p>
            )}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {mfaTicket ? renderMfaForm() : renderLoginForm()}
    </div>
  );
}
