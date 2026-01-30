FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY public /usr/share/nginx/html

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
