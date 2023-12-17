import { useQuery } from "@tanstack/react-query";
import type { APIMessage } from "discord-api-types/v9";
import axios from "axios";
import { Input } from "./components/ui/input";
import { useState } from "react";

function App() {
  const [channelId, setChannelId] = useState("");

  const token = localStorage.getItem("token");
  const query = useQuery<APIMessage[]>({
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
    enabled: !!channelId, // The query will not execute until the channelId is truthy
  });

  if (query.isLoading) {
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

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
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
        {query.data
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
    </div>
  );
}

export default App;
