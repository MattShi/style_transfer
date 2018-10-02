/*****************************************************************************
Copyright: 2017,NCSU
File name:	   fshi4_klu2.cc
Description:  541 hw2
Author: fangyuan shi(fshi4), kai lu(klu2)
Version: v1.01
Date:14/04/2017
History:
*****************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#define bf_t char
#define bits_count 8
#define bits_size 250000
#define byte_len 8
#define bits_per_section 2000000
#define MAXP 17180131327

unsigned long a[8], b[8];

/*************************************************
Function: set_bit_1
Description:  set the specific bit to 1 
Input: bf_t * num pointer 
         int pos position
Output: none
Return: none
Others:
Author: klu2
*************************************************/
void set_bit_1(bf_t * num, int pos){
    int base = pos / byte_len;
    int offset = pos % byte_len;
    *(num+base) |= 1 << offset;
}

/*************************************************
Function: set_bit_0
Description:  set the specific bit to 0
Input: bf_t * num pointer
int pos position
Output: none
Return: none
Others:
Author: klu2
*************************************************/
void set_bit_0(bf_t * num, int pos){
    int base = pos / byte_len;
    int offset = pos % byte_len;
    *(num+base) &= ~(1<<offset);
}

/*************************************************
Function: get_bit
Description:  get the specific bit value
Input: bf_t * num pointer
int pos position
Output: none
Return: int
Others:
Author: fshi4
*************************************************/
int get_bit(bf_t * num, int pos){
    int base = pos / byte_len;
    int offset = pos % byte_len;
    if (*(num+base) & (1 << offset)){
        return 1;
    }else{
        return 0;
    }
}

/*************************************************
Function: cast_str_to_int
Description:  get int from char
Input: str * pointer to char*
int pos position
Output: none
Return: unsigned long
Others:
Author: fshi4
*************************************************/
unsigned long long cast_str_to_int( char *str) {
    unsigned long long hash = 1151;
    int c = 0;

    while (c = *str++) {
        hash = ((hash << 5) + hash) + c;
    }

    return hash;
}

/*
 * this is derived from the text book
 */
int universalhashfunction( char*  key,  int i) {

    unsigned long long key_long = cast_str_to_int(key);
    int res = (int) (((key_long * a[i] + b[i])%MAXP)%bits_per_section);
    return res;
}


/*************************************************
Function: create_bf
Description:  create a bloom filter
Input: none
Output: none
Return: bf_t*
Others:
Author: klu2
*************************************************/
bf_t* create_bf(){
    for (int i = 0;i<bits_count;i++){
        a[i] = (unsigned long)1+ rand()%(MAXP-1); // a must between [1, p-1]
        b[i] = (unsigned long)rand()%MAXP;
    }
    bf_t *bits = (bf_t*) malloc(sizeof(bf_t) * bits_size*bits_count);
    for (int i = 0;i<bits_count*bits_per_section;i++){
        set_bit_0(bits, i);
    }
    return bits;
}



/*************************************************
Function: insert_bf
Description:  insert char* 
Input: none
Output: none
Return: none
Others:
Author: fshi4
*************************************************/
void insert_bf(bf_t *b, char *s){
    int i = 0;
    for (i = 0;i<bits_count;i++){
        int pos = universalhashfunction(s, i);
        set_bit_1(b, i*bits_per_section+pos);
    }
}

/*************************************************
Function: is_element
Description:  check whether q is accepted by the Bloom filter
Input: bf_t  *b	  filter
         char *q	pointer to strig
Output: none
Return: 1 accepted other  no
Others:
Author: klu2
*************************************************/
int is_element(bf_t  *b,  char *q) {
    int i = 0;
    int res = 1;
    for (i = 0;i<bits_count;i++){
        int pos = universalhashfunction(q, i);
        if (get_bit(b, i*bits_per_section+pos) != 1){
            res = 0;
            break;
        }
    }
    return res;
}
