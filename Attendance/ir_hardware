from gpiozero import DigitalInputDevice
from time import sleep

sensor = DigitalInputDevice(27, pull_up=None, active_state=False)

print("IR sensor test started...")
print("Waiting for changes...")

last_value = None

while True:
    value = sensor.value
    is_active = sensor.is_active

    if value != last_value:
        print(f"value = {value}, active = {is_active}")
        last_value = value

    sleep(0.1)
