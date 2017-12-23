FROM node:8

WORKDIR /opt/app
ADD . /opt/app

ENV PATH="/opt/app/bin:${PATH}"

CMD ["node", "."]