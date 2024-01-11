# Freezer 

The idea is to have a live linux which can be loaded into RAM and the usb drive can be plugged off so no data (also not
by accident can be saved)

### How to Create
- Download original slax from https://www.slax.org/
- Burn it onto your usb stick
- Copy the sb files from `/freezer/sb/*` to `/usbstick/slax/modules/`
- If you want to use a printer `/freezer/sb-optional/10-cups-and-printer.sb` to `/usbstick/slax/modules/`
  -  This is an installation of cups. I guess you need to install your printerdriver on your own.
- Boot your PC without HDD and WLAN with slax (AFAIK Legacy Boot) and
- When you see the slax boot screen and press `ESC` to invoike the simple boot menu
- Choose `Run Slax (Copy to RAM)` and when it's done
- UNPLUG THE USB DRIVE
