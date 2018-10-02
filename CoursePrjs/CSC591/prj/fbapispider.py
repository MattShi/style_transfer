import facebook
import json
import requests

fb_token = "EAACEdEose0cBAAVaDL49jMEMpTI0BBC3su1lsN2xlQZBgFxjFGeWZCvVLqZAPO1UTv2SBVOkZB3rRj0im3cdfN1QqY8Sn1YJ8lZA0SMZB2QFlQCQomlfXLAnCZCXTajOy7vZCNDeWSS0jdnZCPhv2jSzZCkvZCbT9MG0BMaf0QBiiF31FRAfFuKFbxLBKmcqPVVWmgWAZCf2FExPJAZDZD"
user_id = ["100004197600512","100011766369930","112040782149039","100002235425017","100011695278416","100000549540120","100000940594029"]

def getpost(token,userid):
    obj_fb=facebook.GraphAPI(token)
    kp_posts = obj_fb.request(userid,{'fields':'posts'})['posts']
    for post in kp_posts['data']:
        #print post['message']
        print post['id']


#id,name,gender,link,picture
def getaccountinfo(token):
    obj_fb=facebook.GraphAPI(token)

    for userid in user_id:
        datalist = obj_fb.request(userid,{'fields':'name'})
        print datalist


def getuserlikes(token,userid):
    obj_fb = facebook.GraphAPI(token)
    datalist = obj_fb.get_connections(id=userid, connection_name="likes")['data']
    for l in datalist:
        print l


if __name__ == '__main__':
    getaccountinfo(fb_token)