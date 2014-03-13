#include<stdio.h>
#include<string.h>
#include <fstream>
#include <windows.h>
#include <shlobj.h>
#include"rapidjson/document.h"
#include<direct.h>
#include <algorithm>

using namespace std;


void sendMessage(const char *message);
void organizeFiles(rapidjson::Document &d);
void BrowseFolder(TCHAR *path);

const string FOLDER_BROWSE = "browseFolders";
const string FILE_ORGANIZE = "organizeFiles";


int main()
{
    int length = 0;
    //read the first four bytes (=> Length)
    for (int i = 0; i < 4; i++){
        length += getchar();
    }
    //read the json-message
    string message = "";
    for (int i = 0; i < length; i++){
        message += getchar();
    }

    rapidjson::Document d;
    d.Parse<0>(message.c_str());

    string commandType = d["commandType"].GetString();

    if(commandType.compare(FILE_ORGANIZE) == 0 ){
        organizeFiles(d);
    }else if( commandType.compare(FOLDER_BROWSE) == 0){
        TCHAR folderPath[MAX_PATH];
        BrowseFolder(folderPath);
        string pathString = folderPath;
        replace (pathString.begin(), pathString.end(), '\\', '/');
        string msg = "{\"folderPath\": \"" + pathString + "\"" + "}";
        sendMessage(msg.c_str());
    }
    return 0;
}

void sendMessage(const char *message){
    unsigned int len = strlen(message);
    printf("%c%c%c%c", (char) (len & 0xff),
                       (char) ((len>>8) & 0xFF),
                       (char) ((len>>16) & 0xFF),
                       (char) ((len>>24) & 0xFF));
    printf("%s", message);
}

void organizeFiles(rapidjson::Document &d){
      string oldPath = d["oldPath"].GetString();
        string newPath = d["newPath"].GetString();
        string fileType = d["type"].GetString();
        string fileName = d["name"].GetString();


        // make the new directory
        _mkdir(newPath.c_str());

        string modifiedPath =  newPath + "\\" + fileType;
        _mkdir(modifiedPath.c_str());

        string organizedPath = modifiedPath + "\\" + fileName;

        if(rename(oldPath.c_str(),organizedPath.c_str()) == 0){
            char message[] = "{\"text\": \"SUCCESS\"}";
            sendMessage(message);
        }else{
            remove(oldPath.c_str());
            char message[] = "{\"text\": \"FAIL\"}";
            sendMessage(message);
        }
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

