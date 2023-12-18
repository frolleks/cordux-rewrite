import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  APIChannel,
  APIMessage,
  RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v9";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const messageFormSchema = z.object({
  content: z.string(),
});

function App() {
  const [channelId, setChannelId] = useState("");

  const token = localStorage.getItem("token");
  const messageQuery = useQuery<APIMessage[]>({
    queryKey: ["messages"],
    queryFn: () => {
      return axios
        .get(
          `https://discord.com/api/v9/channels/${channelId}/messages?limit=50`,
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then((res) => res.data);
    },
    enabled: !!channelId,
  });

  const channelQuery = useQuery<APIChannel>({
    queryKey: ["channels"],
    queryFn: () => {
      return axios
        .get(`https://discord.com/api/v9/channels/${channelId}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => res.data);
    },
    enabled: !!channelId,
  });

  const messageMutation = useMutation({
    mutationFn: (values: RESTPostAPIChannelMessageJSONBody) =>
      axios
        .post(
          `https://discord.com/api/v9/channels/${channelId}/messages`,
          values,
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then((res) => res.data),
  });

  const messageForm = useForm({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { content: "" },
  });

  function handleMessageSubmit(values: z.infer<typeof messageFormSchema>) {
    messageMutation.mutate({ ...values, tts: false });
  }

  if (messageQuery.isLoading) {
    return (
      <div>
        <div>
          <Input
            type="text"
            placeholder="Insert the channel ID here."
            onChange={(e) => {
              setChannelId(e.target.value);
            }}
          />
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (messageQuery.isError) {
    return <div>Error: {messageQuery.error.message}</div>;
  }

  return (
    <div>
      <div>
        <Input
          type="text"
          placeholder="Insert the channel ID here."
          onChange={(e) => {
            setChannelId(e.target.value);
          }}
        />
      </div>
      <div className="space-y-1.5">
        {messageQuery.data
          ?.map((message) => (
            <div key={message.id} className="flex gap-1.5">
              <img
                src={`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=80`}
                alt=""
                className="rounded-full w-12 h-12"
              />
              <div>
                <b>{message.author.global_name}</b>
                <div>
                  <p>{message.content}</p>
                  {message.attachments.map((attachment) => {
                    if (attachment.content_type?.startsWith("image/")) {
                      return (
                        <img
                          src={`${attachment.proxy_url}&format=webp&quality=lossless`}
                          alt={attachment.filename}
                          key={attachment.id}
                        />
                      );
                    } else if (attachment.content_type?.startsWith("video/")) {
                      return (
                        <video key={attachment.id} controls>
                          <source src={attachment.proxy_url} />
                          Your browser does not support the video tag.
                        </video>
                      );
                    }

                    return (
                      <div>
                        <p>{attachment.filename}</p>
                        <a href={attachment.url}>Download</a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
          .reverse()}
      </div>
      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(handleMessageSubmit)}
          className="space-y-1.5"
        >
          <FormField
            control={messageForm.control}
            name="content"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <Input
                    type="text"
                    placeholder={`Message #${channelQuery.data?.name}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

export default App;
