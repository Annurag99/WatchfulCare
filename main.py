import asyncio
import random
import uuid
import os
import certifi
os.environ['SSL_CERT_FILE'] = certifi.where()

from azure.iot.device.aio import IoTHubDeviceClient
from azure.iot.device import Message

CONNECTION_STRING = "HostName=RemotePatientMonitoring.azure-devices.net;DeviceId=Watch;SharedAccessKey=5vKqZ76+WdxF6EV+p6NeqDyzelQVf3pu/AIoTHglEz4="

# Alert thresholds for each sensor
TEMP_ALERT_THRESHOLD_LOW = 36.0  # Low body temperature (hypothermia)
TEMP_ALERT_THRESHOLD_HIGH = 38.0  # High body temperature (fever)
GYRO_ALERT_THRESHOLD = 2.5  # For fall detection
ACCEL_ALERT_THRESHOLD = 2.0  # For fall detection
BP_ALERT_THRESHOLD_LOW = 60  # Low blood pressure (diastolic)
BP_ALERT_THRESHOLD_HIGH = 90  # High blood pressure (diastolic)
HR_ALERT_THRESHOLD_LOW = 60  # Low heart rate alert
HR_ALERT_THRESHOLD_HIGH = 100  # High heart rate alert

# Message format for sending telemetry data
MSG_TXT = """
{{
    "device_id": "{device_id}",
    "sensors": {{
        "temperature": {temperature},
        "gyroscope": {gyroscope},
        "accelerometer": {accelerometer},
        "blood_pressure": {blood_pressure},
        "heart_rate": {heart_rate}
    }},
    "alerts": {{
        "temperatureAlert": "{temperature_alert}",
        "gyroAlert": "{gyro_alert}",
        "accelAlert": "{accel_alert}",
        "bpAlert": "{bp_alert}",
        "hrAlert": "{hr_alert}"
    }}
}}
"""

class DeviceSimulator:
    def __init__(self, device_id, connection_string, sensor_setup):
        self.device_id = device_id
        self.client = IoTHubDeviceClient.create_from_connection_string(connection_string)
        self.sensor_setup = sensor_setup

    async def connect(self):
        await self.client.connect()
        print(f"Device {self.device_id} connected to IoT Hub")

    async def send_telemetry(self):
        while True:
            # Simulate sensor data
            sensor_data = {
                "temperature": self.sensor_setup["temperature"] + random.uniform(-0.5, 0.5),
                "gyroscope": random.uniform(0, 5),
                "accelerometer": random.uniform(0, 5),
                "blood_pressure": random.uniform(50, 150),  # Simulate systolic BP
                "heart_rate": random.uniform(50, 120)
            }

            self.sensor_setup.update(sensor_data)

            # Generate alerts based on thresholds
            temperature_alert = (
                "low" if sensor_data["temperature"] < TEMP_ALERT_THRESHOLD_LOW else
                "high" if sensor_data["temperature"] > TEMP_ALERT_THRESHOLD_HIGH else "normal"
            )

            gyro_alert = "true" if sensor_data["gyroscope"] > GYRO_ALERT_THRESHOLD else "false"
            accel_alert = "true" if sensor_data["accelerometer"] > ACCEL_ALERT_THRESHOLD else "false"
            
            bp_alert = (
                "low" if sensor_data["blood_pressure"] < BP_ALERT_THRESHOLD_LOW else
                "high" if sensor_data["blood_pressure"] > BP_ALERT_THRESHOLD_HIGH else "normal"
            )

            hr_alert = (
                "low" if sensor_data["heart_rate"] < HR_ALERT_THRESHOLD_LOW else
                "high" if sensor_data["heart_rate"] > HR_ALERT_THRESHOLD_HIGH else "normal"
            )

            # Format the message
            msg_txt_formatted = MSG_TXT.format(
                device_id=self.device_id,
                temperature=sensor_data["temperature"],
                gyroscope=sensor_data["gyroscope"],
                accelerometer=sensor_data["accelerometer"],
                blood_pressure=sensor_data["blood_pressure"],
                heart_rate=sensor_data["heart_rate"],
                temperature_alert=temperature_alert,
                gyro_alert=gyro_alert,
                accel_alert=accel_alert,
                bp_alert=bp_alert,
                hr_alert=hr_alert
            )

            message = Message(msg_txt_formatted)
            message.message_id = uuid.uuid4().hex
            message.content_encoding = "utf-8"
            message.content_type = "application/json"
            message.custom_properties['temperatureAlert'] = temperature_alert
            message.custom_properties['gyroAlert'] = gyro_alert
            message.custom_properties['accelAlert'] = accel_alert
            message.custom_properties['bpAlert'] = bp_alert
            message.custom_properties['hrAlert'] = hr_alert

            print(f"Sending message from {self.device_id}: {msg_txt_formatted}")
            await self.client.send_message(message)
            await asyncio.sleep(10)  # Adjust the interval as needed

    async def run(self):
        try:
            await self.connect()
            await self.send_telemetry()
        except asyncio.CancelledError:
            print(f"Device {self.device_id} shutting down.")
        except Exception as e:
            print(f"Error in device {self.device_id}: {str(e)}")

    async def disconnect(self):
        await self.client.disconnect()
        print(f"Device {self.device_id} disconnected from IoT Hub")

if __name__ == "__main__":
    # Initial sensor setup
    sensor_setup = {
        "temperature": 37.0,
        "gyroscope": 0.0,
        "accelerometer": 0.0,
        "blood_pressure": 80.0,
        "heart_rate": 70.0
    }
    device_simulator = DeviceSimulator("Watch", CONNECTION_STRING, sensor_setup)
    asyncio.run(device_simulator.run())
