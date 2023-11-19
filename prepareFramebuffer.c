
// C-Program to prepare for writing to the framebuffer with gstreamer 
// Switches the PI to virtual terminal 7 and set it to graphics mode (i.e. disable blinking cursor)

#include <sys/ioctl.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <linux/vt.h>
#include <linux/fb.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

int openConsole(const char* path) {
        int fd = open(path, O_RDWR);
        if (fd < 0) {
                fd = open(path, O_WRONLY);
        }
        if (fd < 0) {
                fd = open(path, O_RDONLY);
        }
        if (fd < 0) {
                printf("Error opening %s: %s\n", path, strerror(errno));
                exit(-1);
        }
        return fd;
}

void switchTo(int consoleFd, int vt) {
        if (ioctl(consoleFd, VT_ACTIVATE, vt) != 0) {
                printf("Error on switching to console %d: %s\n", vt, strerror(errno));
                exit(-1);
        }
        if (ioctl(consoleFd, VT_WAITACTIVE, vt) != 0) {
                printf("Error waiting for console %d to activate: %s\n", vt, strerror(errno));
                exit(-1);
        }
}

void getFbInfo() {
        int fd = openConsole("/dev/fb0");
        struct fb_var_screeninfo info;
        if (ioctl(fd, FBIOGET_VSCREENINFO, &info) != 0) {
                printf("Could not determine screen res: %s\n", strerror(errno));
                exit(-1);
        }
        printf("Screen data: xRes: %d, xRes: %d, BitsPerPixel: %d\n", info.xres, info.yres, info.bits_per_pixel);
        printf("\txResVirt: %d, yResVirt: %d, xOff: %d, yOff: %d\n", info.xres_virtual, info.yres_virtual, info.xoffset, info.yoffset);
        close(fd);
}

int main(int argc, char** argv) {
        bool setToGraphics = true;
        if (argc >= 2) {
                if (strcmp(argv[1], "0") || strcmp(argv[1], "false")) {
                        printf("Disabling graphics mode\n");
                        setToGraphics = false;
                }
        } else {
                printf("Add false as first parameter to disable graphics mode\n");
        }

        getFbInfo();

        int consoleFd = openConsole("/dev/console");
        if (setToGraphics) {
                switchTo(consoleFd, 7);
        }

        int fd = openConsole("/dev/tty7");

        unsigned int mode = setToGraphics ? KD_GRAPHICS : KD_TEXT;
        if (ioctl(fd, KDSETMODE, mode) != 0) {
                printf("Error on ioctl: %s\n", strerror(errno));
                return -1;
        }

        if (!setToGraphics) {
                switchTo(consoleFd, 1);
        }

        close(consoleFd);
        close(fd);
        return 0;
}
