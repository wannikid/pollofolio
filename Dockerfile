FROM python:3.7-slim-buster

# Copy public code to the container
COPY ./src .

RUN pip3 install pandas
RUN pip3 install -U flask-cors

CMD [ "python", "flask_app.py" ]