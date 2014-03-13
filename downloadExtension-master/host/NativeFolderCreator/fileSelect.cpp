#include<stdio.h>
#include<string.h>
#include <fstream>
#include <windows.h>
#include <shlobj.h>
#include"rapidjson/document.h"
#include<direct.h>
#include <iostream>
#include <algorithm>
/*
using namespace std;

void BrowseFolder(TCHAR *path);
int main(){
    TCHAR folderPath[MAX_PATH];
    BrowseFolder(folderPath);
    string pathString = folderPath;
    std::replace (pathString.begin(), pathString.end(), '\\', '/');
    string msg = "{\"text\": \"" + pathString + "\"" + "}";
    rapidjson::Document d;
    d.Parse<0>(msg.c_str());
    string oldPath = d["text"].GetString();
    cout << oldPath << endl;
    return 0;
}

void BrowseFolder(TCHAR *path)
{

    BROWSEINFO bi = { 0 };
    bi.lpszTitle = ("All Folders Automatically Recursed.");
    LPITEMIDLIST pidl = SHBrowseForFolder ( &bi );

    if ( pidl != 0 )
    {
        // get the name of the folder and put it in path
        SHGetPathFromIDList ( pidl, path );

        //Set the current directory to path
        SetCurrentDirectory ( path );

        // free memory used
        IMalloc * imalloc = 0;
        if ( SUCCEEDED( SHGetMalloc ( &imalloc )) )
        {
            imalloc->Free ( pidl );
            imalloc->Release ( );
        }
    }
}
*/
