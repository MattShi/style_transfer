import getpass
import time
import os
import shutil
import selenium.common.exceptions
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains
import requests


class Downloader:
    def __init__(self):
        # get username and password
        self._username = input('Username: ')
        self._password = getpass.getpass('Password: ')

        # initialise a driver
        self._driver = webdriver.Firefox()

        # set implicitly wait time
        self.timeout = 10
        self._driver.implicitly_wait(self.timeout)

        # initialise cookie
        self._cookies = {}

        # initialise all profile_pages
        self._profile_pages = []

        # set retries
        self._retries = 5

        # set default download path
        self._download_dir = 'photos'
        if not os.path.exists(self._download_dir):
            os.makedirs(self._download_dir)

    def _login(self):
        self._driver.get('https://www.facebook.com')
        assert 'Facebook' in self._driver.title

        # send username and password
        elem = self._driver.find_element_by_id('email')
        elem.send_keys(self._username)

        elem = self._driver.find_element_by_id('pass')
        elem.send_keys(self._password)

        # send enter to login
        elem.send_keys(Keys.RETURN)

    def _get_friend_list(self):
        # go to profile page
        elem = self._driver.find_element_by_xpath('//a[@title="Profile"]')
        elem.click()

        # go to friend page
        elem = self._driver.find_element_by_xpath('//a[@data-tab-key="friends"]')
        elem.click()

        # click on all friends tab
        elem = self._driver.find_element_by_xpath('//a[@name="All friends"]')
        link = elem.get_attribute('href')
        self._driver.get(link)

        # scroll to bottom
        self._scroll_to_bottom()

        # get all friend profile page url
        elems = self._driver.find_elements_by_xpath('//div[@class="uiProfileBlockContent"]/div/div/div/a')
        self._profile_pages = [elem.get_attribute('href') for elem in elems]

    def _download_profile_picture(self):
        # get all friend profile pictures
        for page in self._profile_pages:
            self._driver.get(page)

            # get friend's name
            elem = self._driver.find_element_by_id('fb-timeline-cover-name')
            f_name = elem.text.replace('\n', '')
            print(f_name)

            # get cookie
            all_cookies = self._driver.get_cookies()
            for s_cookie in all_cookies:
                self._cookies[s_cookie["name"]] = s_cookie["value"]

            # get image link
            link = self._get_image_link()

            # download image
            if link:
                response = requests.get(link, stream=True, cookies=self._cookies)
                with open(os.path.join(self._download_dir, f_name), 'wb') as out_file:
                    response.raw.decode_content = True
                    shutil.copyfileobj(response.raw, out_file)
                del response
            else:
                print('skip %s' % f_name)
            self._cookies.clear()

    def _get_image_link(self):
        link = None
        n_retry = 0
        while not link and n_retry < self._retries:
            try:
                # click on thumbnail
                elem = self._driver.find_element_by_xpath('//a[@class="profilePicThumb"]')
                elem.click()

                # mouseover to the profile picture
                WebDriverWait(self._driver, self.timeout).until(EC.presence_of_element_located((By.ID, 'photos_snowlift')))
                hover = ActionChains(self._driver).move_to_element(elem)
                hover.perform()

                # click on option button
                elem = self._driver.find_element_by_xpath('//a[@data-action-type="open_options_flyout"]')
                elem.click()

                # search for downloadable photo
                elem = self._driver.find_element_by_xpath('//*[@data-action-type="download_photo"]/a')
                link = elem.get_attribute('href')

            # for not a downloadable photo
            except selenium.common.exceptions.TimeoutException:
                try:
                    elem = self._driver.find_element_by_xpath(
                        '//div[@role="presentation"]/div[@role="presentation"]/div/div/div/img')
                    link = elem.get_attribute('src')

                # try again
                except selenium.common.exceptions.NoSuchElementException:
                    print('try again')
                    n_retry += 1
                    continue

            # try again
            except selenium.common.exceptions.NoSuchElementException:
                print('try again')
                n_retry += 1
                continue

        return link

    def _scroll_to_bottom(self):
        scroll_pause_time = 2

        # Get scroll height
        last_height = self._driver.execute_script("return document.body.scrollHeight")

        while True:
            # Scroll down to bottom
            self._driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

            # Wait to load page
            time.sleep(scroll_pause_time)

            # Calculate new scroll height and compare with last scroll height
            new_height = self._driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                return
            last_height = new_height

    def run(self):
        print('Login...')
        self._login()

        print('Getting Friend List')
        self._get_friend_list()

        print('Downloading')
        self._download_profile_picture()



from sklearn.decomposition import PCA
from pylab import *
from skimage import data, io, color
def pca_byPython():


    link = "/media/matt/AC32B6AD32B67C40/Users/stone/OneDrive/Courses/2017FALL/CSC591 Data Science/HW/45R/hw45R/hw45R/faces-corrected/subject01.centerlight.pgm"
    coke_gray = io.imread(link, as_grey=True)

    subplot(2, 2, 1)
    io.imshow(coke_gray)
    xlabel('Original Image')

    for i in range(1, 4):
        n_comp = 5 ** i
    pca = PCA(n_components=n_comp)
    pca.fit(coke_gray)
    coke_gray_pca = pca.fit_transform(coke_gray)
    # subplot(2, 2, 2)
    # io.imshow(coke_gray_pca)
    # xlabel('Image after applying PCA')
    coke_gray_restored = pca.inverse_transform(coke_gray_pca)
    subplot(2, 2, i + 1)
    io.imshow(coke_gray_restored)
    xlabel('Restored image n_components = %s' % n_comp)
    print 'Variance retained %s %%' % (
    (1 - sum(pca.explained_variance_ratio_) / size(pca.explained_variance_ratio_)) * 100)
    print 'Compression Ratio %s %%' % (float(size(coke_gray_pca)) / size(coke_gray) * 100)
    show()

if __name__ == '__main__':
    #d = Downloader()
    #d.run()
    pca_byPython()
