// Defines the entry point for the console application.
//

#include <iostream>
#include <sstream>
#include  <string>
#include <vector>
#include <map>

using namespace std;
std::map<std::size_t, std::vector<std::string> >   g_lengthv;


//find all sub str .from the head to the tail, from 1 to the length of string
bool getsubstring(const std::string& str, std::size_t& nNextSubstrPos, std::size_t& nNewSubStrSize)
{
	if ((nNextSubstrPos + nNewSubStrSize) > str.length())	   //the sub str pos comes to the end ,reset it and find a bigger size sub str 
	{
		nNextSubstrPos = 0;
		nNewSubStrSize++;
	}

	if (nNewSubStrSize > ((int)(str.length()) - nNextSubstrPos ))	  //  substr size is too large
	{
		return false;
	}

	nNextSubstrPos++;

	return true;
}

//check whether the string is exist
bool isExist(const std::string& str)
{
	std::vector<std::string> strs = g_lengthv.at(str.length());
	std::vector<std::string>::iterator iIter = strs.begin();
	while (strs.end() != iIter)
	{
		if (0== str.compare(*iIter))
		{
			return true;
		}
		iIter++;
	}
	return false;
}

//
bool findCharPos(char ch, const std::string& str, std::size_t& nOffset)
{
	std::size_t nPos = nOffset;
	while (nPos < (str.length()))
	{
		if (ch == str[nPos])
		{
			nOffset = nPos;
			return true;
		}
		nPos++;
	}
	return false;
}

//
bool findSubStrInTargetStr(const std::string& str, const std::string& strTarget)
{
	if (str.length() > strTarget.length())
	{
		return false;
	}
	if(str.empty() ||
		strTarget.empty())
	{
		return false;
	}

	std::size_t nOffset = 0;
	while (findCharPos(str[0], strTarget, nOffset))	    //check all substrings which begin with str[0] 
	{
		std::size_t i = 0;
		bool bMatch = true;
		while ( (i < str.length()) 
			 && (i< (strTarget.length() - nOffset)))
		{
			if (str[i] != strTarget[nOffset + i])
			{
				bMatch = false;
				break;
			}
			i++;
		}
		if (bMatch)
		{
			return i == str.length(); //
		}
		else
		{
			nOffset++;
		}
	}


	return false;
}

//
int getAllQualifySubStr(const std::string& str1, const std::string& str2)
{
	std::size_t nNextpos = 0;
	std::size_t nNewSubStrSize = 1;
	std::size_t nTotalQualifySubStr = 0;

	std::size_t nLen = str1.length();
	std::size_t  nMapKey = 1;
	while (nMapKey <= nLen)
	{
		std::vector<std::string> vstr;
		g_lengthv[(int)(nMapKey)] = vstr;
		nMapKey++;
	}

	while (getsubstring(str1, nNextpos, nNewSubStrSize))
	{
		std::string strSub = str1.substr(nNextpos - 1, nNewSubStrSize);
		if (strSub.empty())
		{
			continue;
		}
		if (!isExist(strSub))
		{
			g_lengthv.at(strSub.length()).push_back(strSub);
			nTotalQualifySubStr = findSubStrInTargetStr(strSub, str2) ? nTotalQualifySubStr + 1 : nTotalQualifySubStr;
		}
	}
	return nTotalQualifySubStr;
}

int main()
{
	std::string str1;
	std::cout << "please enter the 1st string \n";
	std::getline(std::cin, str1);

	std::string str2;
	std::cout << "please enter the 2nd string \n";
	std::getline(std::cin, str2);

	if (str1.empty()
		|| str2.empty())
	{
		std::cout << "can not processe emptry string \n";
		char c = 0;
		std::cin >> c;
		return 0;
	}

	//we choose the smaller one to get substrs
	if (str1.length() > str2.length())
	{
		std::string strTmp = str2;
		str2 = str1;
		str1 = strTmp;
	} 
	//str1 is the smaller one now

	int nTargetSubStrsNum = getAllQualifySubStr(str1,str2);
    
	std::cout << nTargetSubStrsNum<<"\n";

    return 0;
}

