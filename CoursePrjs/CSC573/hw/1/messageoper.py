#define , create and analysis message
#define msg format by jason

MSG_TYPE_REGISTER = 1
MSG_TYPE_LEAVE = 2
MSG_TYPE_PQUERY = 3
MSG_TYPE_KEEPALIVE = 4
MSG_TYPE_RFCQUERY = 5

DEF_P2P_HEAD = "p2pmsg"
DEF_P2P_MSGTYPE = 'msgtype'
DEF_P2P_PORT = "port"
DEF_P2P_ADDR = "addr"
DEF_P2P_TOKEN = 'token'
DEF_P2P_OPCODE = 'code'
DEF_P2P_QUERYID = 'queryid'
DEF_P2P_DATA = 'data'

import json

class messageoper:
    @staticmethod
    def build_register_req(token):
        data = { DEF_P2P_MSGTYPE :MSG_TYPE_REGISTER,DEF_P2P_TOKEN:token,}
        return json.dumps(data)

    @staticmethod
    def build_register_anw(token):
        data = {DEF_P2P_MSGTYPE: MSG_TYPE_REGISTER, DEF_P2P_TOKEN: token}
        return json.dumps(data)

    @staticmethod
    def build_leave_req(token):
        data = { DEF_P2P_MSGTYPE :MSG_TYPE_LEAVE,DEF_P2P_TOKEN:token}
        return json.dumps(data)

    @staticmethod
    def build_leave_raw(token,opcode):
        data = {DEF_P2P_MSGTYPE: MSG_TYPE_LEAVE, DEF_P2P_TOKEN: token,DEF_P2P_OPCODE:opcode}
        return json.dumps(data)

    @staticmethod
    def build_pquery_req(token):
        data = { DEF_P2P_MSGTYPE :MSG_TYPE_PQUERY,DEF_P2P_TOKEN:token}
        return json.dumps(data)

    @staticmethod
    def build_pquery_raw(token,opcode,rawdata):
        data = {DEF_P2P_MSGTYPE: MSG_TYPE_LEAVE, DEF_P2P_TOKEN: token,DEF_P2P_OPCODE:opcode,DEF_P2P_DATA:json.dumps(rawdata)}
        return json.dumps(data)

    @staticmethod
    def build_keepalive_req(token):
        data = { DEF_P2P_MSGTYPE :MSG_TYPE_KEEPALIVE,DEF_P2P_TOKEN:token}
        return json.dumps(data)

    @staticmethod
    def build_keepalive_raw(token,opcode):
        data = {DEF_P2P_MSGTYPE: MSG_TYPE_KEEPALIVE, DEF_P2P_TOKEN: token,DEF_P2P_OPCODE:opcode}
        return json.dumps(data)

    @staticmethod
    def build_rfcquery_req(token):
        data = {DEF_P2P_MSGTYPE: MSG_TYPE_RFCQUERY, DEF_P2P_TOKEN: token}
        return json.dumps(data)

    @staticmethod
    def build_rfcquery_raw(token,opcode):
        data = {DEF_P2P_MSGTYPE: MSG_TYPE_RFCQUERY, DEF_P2P_TOKEN: token}
        return json.dumps(data)

    @staticmethod
    def analysis_msg(data):
        return json.loads(data)

